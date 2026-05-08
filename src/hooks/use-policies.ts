import { useQuery } from "@tanstack/react-query";
import { getPolicies } from "@/services/policies";
import type { PolicyListParams } from "@/types/policy";

export const policiesQueryKey = (params: PolicyListParams) => ["policies", params] as const;

export const usePolicies = (params: PolicyListParams) =>
  useQuery({
    queryKey: policiesQueryKey(params),
    queryFn: () => getPolicies(params),
  });
