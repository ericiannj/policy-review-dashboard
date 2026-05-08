import { api } from "@/lib/axios";
import type {
  PolicyDetail,
  PolicyListParams,
  PolicyListResponse,
  PolicyPayload,
  PolicyUpdatePayload,
} from "@/types/policy";

export const getPolicies = (params: PolicyListParams): Promise<PolicyListResponse> =>
  api.get("/policies", { params }).then((res) => res.data);

export const getPolicy = (id: string): Promise<PolicyDetail> =>
  api.get(`/policies/${id}`).then((res) => res.data);

export const createPolicy = (payload: PolicyPayload): Promise<PolicyDetail> =>
  api.post("/policies", payload).then((res) => res.data);

export const updatePolicy = (id: string, payload: PolicyUpdatePayload): Promise<PolicyDetail> =>
  api.patch(`/policies/${id}`, payload).then((res) => res.data);

export const deletePolicy = (id: string): Promise<{ success: boolean }> =>
  api.delete(`/policies/${id}`).then((res) => res.data);
