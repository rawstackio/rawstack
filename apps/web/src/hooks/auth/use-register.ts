import { register } from '@/actions/auth';
import { useAuth } from '@/lib/context/auth-context';
import UserModel from '@/lib/model/user-model';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface RegisterParams {
  email: string;
  password: string;
}

export function useRegister(options?: UseMutationWithCallbacksOptions<RegisterParams>) {
  const { refreshUser } = useAuth();

  const { mutate, isPending } = useMutationWithCallbacks(async (data: RegisterParams) => {
    const result = await register(data.email, data.password);
    await refreshUser();
    if (!result.ok) throw new Error(result.error.message);
    return UserModel.createFromApiUser(result.user);
  }, options);

  return { register: mutate, isBusy: isPending };
}
