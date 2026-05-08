import { useQuery } from "@tanstack/react-query";
import { getPolicy } from "@/services/policies";

export const policyQueryKey = (id: string) => ["policy", id] as const;

export const usePolicy = (id: string | undefined) =>
  useQuery({
    queryKey: policyQueryKey(id ?? ""),
    queryFn: () => getPolicy(id as string),
    enabled: id !== undefined,
  });
