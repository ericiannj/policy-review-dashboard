import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePolicy } from "@/services/policies";
import type { PolicyUpdatePayload } from "@/types/policy";
import { policyQueryKey } from "./use-policy";

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PolicyUpdatePayload }) =>
      updatePolicy(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: policyQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
};
