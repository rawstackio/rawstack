import Api from '@/lib/api/Api';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface VerifyEmailParams {
  token: string;
}

export function useVerifyEmail(options?: UseMutationWithCallbacksOptions) {
  const { mutate, isPending, isSuccess, isError } = useMutationWithCallbacks(
    (data: VerifyEmailParams) => Api.auth.createActionRequest({ token: data.token }),
    options,
  );

  return { verifyEmail: mutate, isBusy: isPending, isSuccess, isError };
}
