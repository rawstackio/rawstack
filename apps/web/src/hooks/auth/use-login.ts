import { useAuth, UserCredentials } from '@/lib/context/auth-context';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

export function useLogin(options?: UseMutationWithCallbacksOptions) {
  const { login } = useAuth();

  const { mutate, isPending } = useMutationWithCallbacks((credentials: UserCredentials) => login(credentials), options);

  return { login: mutate, isBusy: isPending };
}
