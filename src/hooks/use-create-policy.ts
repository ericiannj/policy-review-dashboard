import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPolicy } from "@/services/policies";

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
};
