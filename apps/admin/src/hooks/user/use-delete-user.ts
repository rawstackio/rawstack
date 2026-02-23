import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';
import { UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks.ts';

export function useDeleteUser(options?: UseMutationWithCallbacksOptions<string>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (userId: string) => {
      return Api.user.deleteUser(userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onSuccess?.(variables);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { deleteUser: mutate, isBusy: isPending };
}
