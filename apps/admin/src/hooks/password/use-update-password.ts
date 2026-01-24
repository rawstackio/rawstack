import { useMutation } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';
import { useAuth } from '@/lib/context/auth-context.tsx';

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
        return Promise.reject('User not set');
      }
      return Api.user.updateUser(user.id, {
        password: data.password,
      });
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return { updatedPassword: mutate, isBusy: isPending };
}
