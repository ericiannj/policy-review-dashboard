import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardPage from "./DashboardPage";

const BASE_URL = "http://localhost:4000";

const POLICY_1 = {
  id: "POL-1001",
  accountName: "Sunrise Care",
  region: "Northeast",
  facilityCount: 2,
  effectiveDate: "2026-06-01",
  premium: 100_000,
  claimsTotal: 30_000,
  reimbursementRisk: 0.35,
};

const POLICY_2 = {
  id: "POL-1002",
  accountName: "Green Valley Hospital",
  region: "Southeast",
  facilityCount: 5,
  effectiveDate: "2026-07-15",
  premium: 250_000,
  claimsTotal: 180_000,
  reimbursementRisk: 0.75,
};

const POLICY_1_DETAIL = {
  id: "POL-1001",
  account: { name: "Sunrise Care", region: "Northeast", facilityCount: 2 },
  renewal: { effectiveDate: "2026-06-01", daysUntilRenewal: 25 },
  compliance: { missingDocuments: 1, expiredDocuments: 0, pendingReviews: [] },
  financials: { premium: 100_000, claimsTotal: 30_000, reimbursementRisk: 0.35 },
};

const server = setupServer(
  http.get(`${BASE_URL}/policies`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const region = url.searchParams.get("region");
    const page = url.searchParams.get("page");

    if (search === "Sunrise") {
      return HttpResponse.json({
        data: [POLICY_1],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    }
    if (region === "Northeast") {
      return HttpResponse.json({
        data: [POLICY_1],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    }
    if (page === "2") {
      return HttpResponse.json({
        data: [POLICY_2],
        pagination: { page: 2, limit: 20, total: 2, totalPages: 2 },
      });
    }
    return HttpResponse.json({
      data: [POLICY_1, POLICY_2],
      pagination: { page: 1, limit: 20, total: 2, totalPages: 2 },
    });
  }),
  http.get(`${BASE_URL}/policies/:id`, () => HttpResponse.json(POLICY_1_DETAIL)),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderPage(initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DashboardPage />
        </TooltipProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("DashboardPage integration", () => {
  it("renders the full policy list", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Sunrise Care")).toBeInTheDocument();
      expect(screen.getByText("Green Valley Hospital")).toBeInTheDocument();
    });

    expect(screen.getByRole("columnheader", { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /region/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /risk/i })).toBeInTheDocument();
  });

  it("search URL param shows only matching policies", async () => {
    renderPage("/?search=Sunrise");

    await waitFor(() => {
      expect(screen.getByText("Sunrise Care")).toBeInTheDocument();
    });

    expect(screen.queryByText("Green Valley Hospital")).not.toBeInTheDocument();
  });

  it("page=2 URL param shows the second page of results", async () => {
    renderPage("/?page=2");

    await waitFor(() => {
      expect(screen.getByText("Green Valley Hospital")).toBeInTheDocument();
    });

    expect(screen.queryByText("Sunrise Care")).not.toBeInTheDocument();
  });

  it("clicking Next page button loads page 2", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Sunrise Care")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /next page/i }));

    await waitFor(() => {
      expect(screen.getByText("Green Valley Hospital")).toBeInTheDocument();
    });

    expect(screen.queryByText("Sunrise Care")).not.toBeInTheDocument();
  });

  it("clicking a policy row expands it and shows the detail panel", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Sunrise Care")).toBeInTheDocument();
    });

    const row = screen.getByText("Sunrise Care").closest("tr") as HTMLElement;
    await user.click(row);

    await waitFor(() => {
      // "25 days" only appears in the detail panel, not in the table column
      expect(screen.getByText("25 days")).toBeInTheDocument();
    });

    expect(row).toHaveAttribute("aria-expanded", "true");
  });

  it("opening filter modal, selecting a region, and applying shows a filter chip", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Sunrise Care")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /open filters/i }));
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Northeast" }));
    await user.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() => {
      expect(screen.getByText("Region: Northeast")).toBeInTheDocument();
    });
  });

  it("skeleton shows aria-busy while data is loading", () => {
    renderPage();

    const tableBody = document.querySelector("tbody");
    expect(tableBody).toHaveAttribute("aria-busy", "true");
  });

  it("error state shows a retry button when the API fails", async () => {
    server.use(
      http.get(`${BASE_URL}/policies`, () =>
        HttpResponse.json(
          { error: { code: "internal_error", message: "Server error" } },
          { status: 500 },
        ),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });
  });

  it("empty state shows when no policies match the search", async () => {
    server.use(
      http.get(`${BASE_URL}/policies`, () =>
        HttpResponse.json({
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        }),
      ),
    );

    renderPage("/?search=zzz");

    await waitFor(() => {
      expect(screen.getByRole("status", { name: /no policies found/i })).toBeInTheDocument();
    });
  });
});
