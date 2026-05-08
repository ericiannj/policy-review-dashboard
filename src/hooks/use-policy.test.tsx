import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { usePolicy } from "./use-policy";

const BASE_URL = "http://localhost:4000";

const MOCK_DETAIL = {
  id: "POL-1001",
  account: { name: "Sunrise Care", region: "Northeast", facilityCount: 2 },
  renewal: { effectiveDate: "2026-06-01", daysUntilRenewal: 25 },
  compliance: { missingDocuments: 0, expiredDocuments: 0, pendingReviews: [] },
  financials: { premium: 100000, claimsTotal: 30000, reimbursementRisk: 0.35 },
};

const server = setupServer(
  http.get(`${BASE_URL}/policies/:id`, ({ params }) => {
    if (params.id === "POL-9999") {
      return HttpResponse.json(
        { error: { code: "not_found", message: "Policy not found" } },
        { status: 404 },
      );
    }
    return HttpResponse.json(MOCK_DETAIL);
  }),
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

describe("usePolicy", () => {
  it("does not fetch when id is undefined (enabled: false)", () => {
    const { result } = renderHook(() => usePolicy(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("returns detail data when id is provided", async () => {
    const { result } = renderHook(() => usePolicy("POL-1001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_DETAIL);
  });

  it("enters error state on 404", async () => {
    const { result } = renderHook(() => usePolicy("POL-9999"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
