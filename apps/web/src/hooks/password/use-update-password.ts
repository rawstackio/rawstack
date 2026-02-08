import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/context/auth-context';
import Api from '@/lib/api/Api';

interface UpdatePasswordParams {
  password: string;
}

interface UseUpdatePasswordOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useUpdatePassword(options?: UseUpdatePasswordOptions) {
  const { user } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdatePasswordParams) => {
      if (!user) {
        return Promise.reject(new Error('User not authenticated'));
      }
      return Api.user.updateUser(user.id, {
        password: data.password,
      });
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { updatePassword: mutate, isBusy: isPending };
}
