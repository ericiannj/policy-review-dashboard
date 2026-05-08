import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { usePolicies } from "./use-policies";

const BASE_URL = "http://localhost:4000";

const MOCK_RESPONSE = {
  data: [
    {
      id: "POL-1001",
      accountName: "Sunrise Care",
      region: "Northeast",
      facilityCount: 2,
      effectiveDate: "2026-06-01",
      premium: 100000,
      claimsTotal: 30000,
      reimbursementRisk: 0.35,
    },
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

const server = setupServer(
  http.get(`${BASE_URL}/policies`, () => HttpResponse.json(MOCK_RESPONSE)),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePolicies", () => {
  it("starts in pending state before data loads", () => {
    const { result } = renderHook(() => usePolicies({ page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });
    expect(result.current.isPending).toBe(true);
  });

  it("returns list data on success", async () => {
    const { result } = renderHook(() => usePolicies({ page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_RESPONSE);
  });

  it("enters error state when API returns 500", async () => {
    server.use(
      http.get(`${BASE_URL}/policies`, () =>
        HttpResponse.json(
          { error: { code: "internal_error", message: "Server error" } },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(() => usePolicies({ page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
