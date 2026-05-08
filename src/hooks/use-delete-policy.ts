import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePolicy } from "@/services/policies";

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
};
