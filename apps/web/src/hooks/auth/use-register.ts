import { useAuth } from '@/lib/context/auth-context';
import Api from '@/lib/api/Api';
import UserModel from '@/lib/model/UserModel';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface RegisterParams {
  email: string;
  password: string;
}

export function useRegister(options?: UseMutationWithCallbacksOptions) {
  const { login } = useAuth();

  const { mutate, isPending } = useMutationWithCallbacks(async (data: RegisterParams) => {
    const response = await Api.user.createUser({
      email: data.email.toLowerCase(),
      password: data.password,
    });

    const user = UserModel.createFromApiUser(response.data.item);
    await login({ email: data.email, password: data.password }, user);

    return user;
  }, options);

  return { register: mutate, isBusy: isPending };
}
