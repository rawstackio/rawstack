import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';

interface UseDeleteUserOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useDeleteUser(options?: UseDeleteUserOptions) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (userId: string) => {
      return Api.user.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { deleteUser: mutate, isBusy: isPending };
}
