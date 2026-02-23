import Api from '@/lib/api/Api';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface ResendVerificationEmailParams {
  userId: string;
  unverifiedEmail: string;
}

export function useResendVerificationEmail(options?: UseMutationWithCallbacksOptions) {
  const { mutate, isPending } = useMutationWithCallbacks(
    (data: ResendVerificationEmailParams) => Api.user.updateUser(data.userId, { email: data.unverifiedEmail }),
    options,
  );

  return { resendVerificationEmail: mutate, isBusy: isPending };
}
