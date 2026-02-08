import { useMutation } from '@tanstack/react-query';
import Api from '@/lib/api/Api';

interface UpdateAccountParams {
  userId: string;
  email: string;
  password?: string;
}

interface UseUpdateAccountOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useUpdateAccount(options?: UseUpdateAccountOptions) {
  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateAccountParams) => {
      return Api.user.updateUser(data.userId, {
        email: data.email,
        password: data.password || undefined,
      });
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { updateAccount: mutate, isBusy: isPending };
}
