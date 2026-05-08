import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { PolicyDetail, PolicySummary } from "@/types/policy";
import ExpandedPolicyRow from "./ExpandedPolicyRow";
import PoliciesTable from "./PoliciesTable";

const BASE_URL = "http://localhost:4000";

const MOCK_DETAIL: PolicyDetail = {
  id: "POL-1001",
  account: { name: "Sunrise Care", region: "Northeast", facilityCount: 2 },
  renewal: { effectiveDate: "2026-06-01", daysUntilRenewal: 25 },
  compliance: {
    missingDocuments: 3,
    expiredDocuments: 1,
    pendingReviews: [{ type: "License", dueDate: "2026-05-07", severity: "high" }],
  },
  financials: { premium: 128000, claimsTotal: 42100, reimbursementRisk: 0.24 },
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

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Stateful wrapper that mimics DashboardPage row-expansion logic
const mockPolicies: PolicySummary[] = [
  {
    id: "POL-1001",
    accountName: "Sunrise Care Center",
    region: "Northeast",
    facilityCount: 3,
    effectiveDate: "2026-06-01",
    premium: 128000,
    claimsTotal: 42100,
    reimbursementRisk: 0.24,
  },
  {
    id: "POL-1002",
    accountName: "Green Valley Hospital",
    region: "Southeast",
    facilityCount: 5,
    effectiveDate: "2026-07-15",
    premium: 250000,
    claimsTotal: 180000,
    reimbursementRisk: 0.75,
  },
];

function TableWithExpansion() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <PoliciesTable
      policies={mockPolicies}
      expandedId={expandedId}
      onToggleRow={(id) => setExpandedId((curr) => (curr === id ? null : id))}
    />
  );
}

describe("ExpandedPolicyRow", () => {
  it("renders renewal, financial, and compliance data", async () => {
    render(<ExpandedPolicyRow id="POL-1001" />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Jun 1, 2026")).toBeInTheDocument();
      expect(screen.getByText("25 days")).toBeInTheDocument();
      expect(screen.getByText("$128,000")).toBeInTheDocument();
      expect(screen.getByText("$42,100")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("License")).toBeInTheDocument();
    });
  });

  it("shows error state when detail fetch returns 404", async () => {
    render(<ExpandedPolicyRow id="POL-9999" />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/failed to load policy details/i)).toBeInTheDocument();
    });
  });

  it("clicking a second row collapses the first and expands the second", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <TableWithExpansion />
      </QueryClientProvider>,
    );

    const firstRow = screen.getByText("Sunrise Care Center").closest("tr") as HTMLElement;
    const secondRow = screen.getByText("Green Valley Hospital").closest("tr") as HTMLElement;

    // Click first row — it expands
    await user.click(firstRow);
    expect(firstRow).toHaveAttribute("aria-expanded", "true");
    expect(secondRow).toHaveAttribute("aria-expanded", "false");

    // Click second row — first collapses, second expands
    await user.click(secondRow);
    expect(firstRow).toHaveAttribute("aria-expanded", "false");
    expect(secondRow).toHaveAttribute("aria-expanded", "true");
  });

  it("clicking the same expanded row toggles it closed", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <TableWithExpansion />
      </QueryClientProvider>,
    );

    const firstRow = screen.getByText("Sunrise Care Center").closest("tr") as HTMLElement;

    await user.click(firstRow);
    expect(firstRow).toHaveAttribute("aria-expanded", "true");

    await user.click(firstRow);
    expect(firstRow).toHaveAttribute("aria-expanded", "false");
  });

  it("formats negative daysUntilRenewal as overdue", async () => {
    server.use(
      http.get(`${BASE_URL}/policies/:id`, () =>
        HttpResponse.json({
          ...MOCK_DETAIL,
          renewal: { effectiveDate: "2026-04-01", daysUntilRenewal: -5 },
        }),
      ),
    );

    render(<ExpandedPolicyRow id="POL-1001" />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Overdue by 5 days")).toBeInTheDocument();
    });
  });
});
