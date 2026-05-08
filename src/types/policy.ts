export type Region = "Northeast" | "Southeast" | "Midwest" | "Southwest" | "West";

export type PendingReviewType =
  | "License"
  | "Staff Training"
  | "Incident Report"
  | "Billing Documentation"
  | "Care Plan"
  | "Medication Log"
  | "Facility Inspection"
  | "Insurance Certificate";

export type ReviewSeverity = "low" | "medium" | "high" | "critical";

export interface PendingReview {
  type: PendingReviewType;
  dueDate: string;
  severity: ReviewSeverity;
}

// Flat shape returned by GET /policies
export interface PolicySummary {
  id: string;
  accountName: string;
  region: Region;
  facilityCount: number;
  effectiveDate: string;
  premium: number;
  claimsTotal: number;
  reimbursementRisk: number;
}

// Full nested shape returned by GET /policies/:id
export interface PolicyDetail {
  id: string;
  account: {
    name: string;
    region: Region;
    facilityCount: number;
  };
  renewal: {
    effectiveDate: string;
    daysUntilRenewal: number;
  };
  compliance: {
    missingDocuments: number;
    expiredDocuments: number;
    pendingReviews: PendingReview[];
  };
  financials: {
    premium: number;
    claimsTotal: number;
    reimbursementRisk: number;
  };
}

// Body for POST /policies (full nested, no id) and base for PATCH
export type PolicyPayload = Omit<PolicyDetail, "id">;

// Deep-partial payload for PATCH /policies/:id (API deep-merges nested objects)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

export type PolicyUpdatePayload = DeepPartial<PolicyPayload>;

// Query params for GET /policies
export interface PolicyListParams {
  page?: number;
  limit?: number;
  search?: string;
  region?: Region;
  effectiveDateFrom?: string;
  effectiveDateTo?: string;
  premiumMin?: number;
  premiumMax?: number;
  claimsTotalMin?: number;
  claimsTotalMax?: number;
  reimbursementRiskMin?: number;
  reimbursementRiskMax?: number;
}

// Response shape for GET /policies
export interface PolicyListResponse {
  data: PolicySummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
