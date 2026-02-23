import { useAuth } from '@/lib/context/auth-context';
import Api from '@/lib/api/Api';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface UpdatePasswordParams {
  password: string;
}

export function useUpdatePassword(options?: UseMutationWithCallbacksOptions<UpdatePasswordParams>) {
  const { user } = useAuth();

  const { mutate, isPending } = useMutationWithCallbacks((data: UpdatePasswordParams) => {
    if (!user) {
      return Promise.reject(new Error('User not authenticated'));
    }
    return Api.user.updateUser(user.id, {
      password: data.password,
    });
  }, options);

  return { updatePassword: mutate, isBusy: isPending };
}
