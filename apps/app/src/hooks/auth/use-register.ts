import { useMutationWithCallbacks, UseMutationWithCallbacksOptions } from '../use-mutation-with-callbacks.ts';
import { useAuth } from '../../lib/context/AuthContext.tsx';
import Api from '../../lib/api/Api.ts';
import UserModel from '../../lib/model/UserModel.ts';

interface RegisterParams {
  email: string;
  password: string;
}

export function useRegister(options?: UseMutationWithCallbacksOptions<RegisterParams>) {
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
