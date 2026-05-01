import { updateUser } from '@/actions/user';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface ResendVerificationEmailParams {
  userId: string;
  unverifiedEmail: string;
}

export function useResendVerificationEmail(options?: UseMutationWithCallbacksOptions<ResendVerificationEmailParams>) {
  const { mutate, isPending } = useMutationWithCallbacks(
    (data: ResendVerificationEmailParams) => updateUser(data.userId, { email: data.unverifiedEmail }),
    options,
  );

  return { resendVerificationEmail: mutate, isBusy: isPending };
}
