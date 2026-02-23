import Api from '@/lib/api/api.ts';
import { useMutationWithCallbacks, UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks.ts';

interface PasswordResetRequestParams {
  email: string;
}

export function useCreatePasswordResetRequest(options?: UseMutationWithCallbacksOptions<PasswordResetRequestParams>) {
  const { mutate, isPending } = useMutationWithCallbacks((data: PasswordResetRequestParams) => {
    return Api.auth.createToken({
      email: data.email,
    });
  }, options);

  return { createPasswordResetRequest: mutate, isBusy: isPending };
}
