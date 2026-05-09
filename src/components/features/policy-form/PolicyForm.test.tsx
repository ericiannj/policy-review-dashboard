import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { describe, expect, it, vi } from "vitest";
import type { PolicyDetail } from "@/types/policy";
import PolicyForm from "./PolicyForm";

const BASE_URL = "http://localhost:4000";

const MOCK_DETAIL: PolicyDetail = {
  id: "POL-1001",
  account: { name: "Sunrise Care", region: "Northeast", facilityCount: 2 },
  renewal: { effectiveDate: "2026-06-01", daysUntilRenewal: 25 },
  compliance: { missingDocuments: 0, expiredDocuments: 1, pendingReviews: [] },
  financials: { premium: 128000, claimsTotal: 42100, reimbursementRisk: 0.24 },
};

const server = setupServer(
  http.post(`${BASE_URL}/policies`, async () =>
    HttpResponse.json({ ...MOCK_DETAIL, id: "POL-1101" }, { status: 201 }),
  ),
  http.patch(`${BASE_URL}/policies/:id`, async () => HttpResponse.json(MOCK_DETAIL)),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/account name/i), {
    target: { value: "Test Facility" },
  });
  fireEvent.change(screen.getByLabelText(/effective date/i), {
    target: { value: "2026-12-01" },
  });
  fireEvent.change(screen.getByLabelText(/^premium/i), { target: { value: "95000" } });
  fireEvent.change(screen.getByLabelText(/claims total/i), { target: { value: "12000" } });
  fireEvent.change(screen.getByLabelText(/reimbursement risk/i), { target: { value: "0.15" } });
}

describe("PolicyForm", () => {
  it("blocks submit when required fields are empty", () => {
    const onSuccess = vi.fn();
    render(<PolicyForm mode="create" onSuccess={onSuccess} />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /create policy/i }));

    expect(screen.getByText(/account name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/effective date is required/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("shows validation error when reimbursement risk is out of range", () => {
    render(<PolicyForm mode="create" onSuccess={vi.fn()} />, { wrapper: makeWrapper() });

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/reimbursement risk/i), { target: { value: "1.5" } });
    fireEvent.click(screen.getByRole("button", { name: /create policy/i }));

    expect(screen.getByText(/between 0 and 1/i)).toBeInTheDocument();
  });

  it("calls POST when create mode form is submitted with valid data", async () => {
    let capturedBody: unknown = null;
    server.use(
      http.post(`${BASE_URL}/policies`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ id: "POL-1101" }, { status: 201 });
      }),
    );

    const onSuccess = vi.fn();
    render(<PolicyForm mode="create" onSuccess={onSuccess} />, { wrapper: makeWrapper() });

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /create policy/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(capturedBody).toMatchObject({
      account: { name: "Test Facility" },
      financials: { premium: 95000, claimsTotal: 12000, reimbursementRisk: 0.15 },
    });
  });

  it("calls PATCH when edit mode form is submitted", async () => {
    let patchCalled = false;
    server.use(
      http.patch(`${BASE_URL}/policies/POL-1001`, async () => {
        patchCalled = true;
        return HttpResponse.json(MOCK_DETAIL);
      }),
    );

    const onSuccess = vi.fn();
    render(<PolicyForm mode="edit" policy={MOCK_DETAIL} onSuccess={onSuccess} />, {
      wrapper: makeWrapper(),
    });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(patchCalled).toBe(true);
  });

  it("pre-populates fields in edit mode from policy data", () => {
    render(<PolicyForm mode="edit" policy={MOCK_DETAIL} onSuccess={vi.fn()} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByLabelText(/account name/i)).toHaveValue("Sunrise Care");
    expect(screen.getByLabelText(/^premium/i)).toHaveValue(128000);
    expect(screen.getByLabelText(/claims total/i)).toHaveValue(42100);
    expect(screen.getByLabelText(/effective date/i)).toHaveValue("2026-06-01");
  });

  it("disables submit button while mutation is in flight", async () => {
    server.use(
      http.post(`${BASE_URL}/policies`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ id: "POL-1101" }, { status: 201 });
      }),
    );

    render(<PolicyForm mode="create" onSuccess={vi.fn()} />, { wrapper: makeWrapper() });

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /create policy/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled());
  });

  it("adds a pending review when Add review is clicked", async () => {
    const user = userEvent.setup();
    render(<PolicyForm mode="create" onSuccess={vi.fn()} />, { wrapper: makeWrapper() });

    await user.click(screen.getByRole("button", { name: /add review/i }));

    expect(screen.getByLabelText(/pending review 1/i)).toBeInTheDocument();
  });

  it("removes a pending review when Remove is clicked", async () => {
    const user = userEvent.setup();
    render(<PolicyForm mode="create" onSuccess={vi.fn()} />, { wrapper: makeWrapper() });

    await user.click(screen.getByRole("button", { name: /add review/i }));
    expect(screen.getByLabelText(/pending review 1/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remove review 1/i }));

    expect(screen.queryByLabelText(/pending review 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no pending reviews/i)).toBeInTheDocument();
  });

  it("sends full pending reviews array in PATCH body", async () => {
    const policyWithReviews: PolicyDetail = {
      ...MOCK_DETAIL,
      compliance: {
        ...MOCK_DETAIL.compliance,
        pendingReviews: [{ type: "License", dueDate: "2026-06-01", severity: "high" }],
      },
    };

    let capturedBody: unknown = null;
    server.use(
      http.patch(`${BASE_URL}/policies/POL-1001`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json(policyWithReviews);
      }),
    );

    const onSuccess = vi.fn();
    render(<PolicyForm mode="edit" policy={policyWithReviews} onSuccess={onSuccess} />, {
      wrapper: makeWrapper(),
    });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(capturedBody).toMatchObject({
      compliance: {
        pendingReviews: [{ type: "License", dueDate: "2026-06-01", severity: "high" }],
      },
    });
  });
});
