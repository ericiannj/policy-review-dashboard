import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import DeletePolicyDialog from "./DeletePolicyDialog";

const BASE_URL = "http://localhost:4000";

const server = setupServer(
  http.delete(`${BASE_URL}/policies/:id`, () => HttpResponse.json({ success: true })),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe("DeletePolicyDialog", () => {
  it("Cancel closes dialog without calling delete", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onDeleted = vi.fn();

    render(
      <DeletePolicyDialog
        policyId="POL-1001"
        open={true}
        onClose={onClose}
        onDeleted={onDeleted}
      />,
      { wrapper: makeWrapper() },
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("Confirm calls delete mutation and then calls onDeleted and onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onDeleted = vi.fn();

    render(
      <DeletePolicyDialog
        policyId="POL-1001"
        open={true}
        onClose={onClose}
        onDeleted={onDeleted}
      />,
      { wrapper: makeWrapper() },
    );

    await user.click(screen.getByRole("button", { name: /confirm delete/i }));

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it("Delete and Cancel buttons are disabled during in-flight mutation", async () => {
    const user = userEvent.setup();

    server.use(
      http.delete(`${BASE_URL}/policies/:id`, async () => {
        await new Promise<never>(() => {});
      }),
    );

    render(
      <DeletePolicyDialog policyId="POL-1001" open={true} onClose={vi.fn()} onDeleted={vi.fn()} />,
      { wrapper: makeWrapper() },
    );

    await user.click(screen.getByRole("button", { name: /confirm delete/i }));

    expect(screen.getByRole("button", { name: /confirm delete/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  it("success collapses the row by calling onDeleted", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();

    render(
      <DeletePolicyDialog
        policyId="POL-1001"
        open={true}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
      { wrapper: makeWrapper() },
    );

    await user.click(screen.getByRole("button", { name: /confirm delete/i }));

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledOnce();
    });
  });
});
