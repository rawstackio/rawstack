import Api from '@/lib/api/api.ts';
import { useAuth } from '@/lib/context/auth-context.tsx';
import { useMutationWithCallbacks, UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks.ts';

interface UpdatePasswordParams {
  password: string;
}

export function useUpdatePassword(options?: UseMutationWithCallbacksOptions<UpdatePasswordParams>) {
  const { user } = useAuth();

  const { mutate, isPending } = useMutationWithCallbacks((data: UpdatePasswordParams) => {
    if (!user) {
      return Promise.reject('User not set');
    }
    return Api.user.updateUser(user.id, {
      password: data.password,
    });
  }, options);

  return { updatedPassword: mutate, isBusy: isPending };
}
