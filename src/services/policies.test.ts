import { api } from "@/lib/axios";
import { createPolicy, deletePolicy, getPolicies, getPolicy, updatePolicy } from "./policies";

vi.mock("@/lib/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

const POLICY_SUMMARY = {
  id: "POL-1001",
  accountName: "Sunrise Care",
  region: "Northeast" as const,
  facilityCount: 2,
  effectiveDate: "2026-06-01",
  premium: 100000,
  claimsTotal: 30000,
  reimbursementRisk: 0.35,
};

const POLICY_DETAIL = {
  id: "POL-1001",
  account: { name: "Sunrise Care", region: "Northeast" as const, facilityCount: 2 },
  renewal: { effectiveDate: "2026-06-01", daysUntilRenewal: 25 },
  compliance: { missingDocuments: 0, expiredDocuments: 0, pendingReviews: [] },
  financials: { premium: 100000, claimsTotal: 30000, reimbursementRisk: 0.35 },
};

const POLICY_PAYLOAD = {
  account: { name: "Sunrise Care", region: "Northeast" as const, facilityCount: 2 },
  renewal: { effectiveDate: "2026-06-01", daysUntilRenewal: 25 },
  compliance: { missingDocuments: 0, expiredDocuments: 0, pendingReviews: [] },
  financials: { premium: 100000, claimsTotal: 30000, reimbursementRisk: 0.35 },
};

describe("policies service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPolicies", () => {
    it("calls GET /policies with provided params", async () => {
      const mockResponse = {
        data: [POLICY_SUMMARY],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      vi.mocked(mockApi.get).mockResolvedValueOnce({ data: mockResponse });

      const params = { page: 1, limit: 20, search: "Sunrise" };
      const result = await getPolicies(params);

      expect(mockApi.get).toHaveBeenCalledWith("/policies", { params });
      expect(result).toEqual(mockResponse);
    });

    it("forwards all filter params", async () => {
      vi.mocked(mockApi.get).mockResolvedValueOnce({
        data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      });

      const params = { region: "Midwest" as const, premiumMin: 50000, premiumMax: 200000 };
      await getPolicies(params);

      expect(mockApi.get).toHaveBeenCalledWith("/policies", { params });
    });
  });

  describe("getPolicy", () => {
    it("calls GET /policies/:id with correct id", async () => {
      vi.mocked(mockApi.get).mockResolvedValueOnce({ data: POLICY_DETAIL });

      const result = await getPolicy("POL-1001");

      expect(mockApi.get).toHaveBeenCalledWith("/policies/POL-1001");
      expect(result).toEqual(POLICY_DETAIL);
    });
  });

  describe("createPolicy", () => {
    it("calls POST /policies with payload and returns created policy", async () => {
      vi.mocked(mockApi.post).mockResolvedValueOnce({ data: POLICY_DETAIL });

      const result = await createPolicy(POLICY_PAYLOAD);

      expect(mockApi.post).toHaveBeenCalledWith("/policies", POLICY_PAYLOAD);
      expect(result).toEqual(POLICY_DETAIL);
    });
  });

  describe("updatePolicy", () => {
    it("calls PATCH /policies/:id with id and partial payload", async () => {
      const partialPayload = { financials: { premium: 150000 } };
      vi.mocked(mockApi.patch).mockResolvedValueOnce({ data: POLICY_DETAIL });

      const result = await updatePolicy("POL-1001", partialPayload);

      expect(mockApi.patch).toHaveBeenCalledWith("/policies/POL-1001", partialPayload);
      expect(result).toEqual(POLICY_DETAIL);
    });
  });

  describe("deletePolicy", () => {
    it("calls DELETE /policies/:id and returns success", async () => {
      vi.mocked(mockApi.delete).mockResolvedValueOnce({ data: { success: true } });

      const result = await deletePolicy("POL-1001");

      expect(mockApi.delete).toHaveBeenCalledWith("/policies/POL-1001");
      expect(result).toEqual({ success: true });
    });
  });
});
