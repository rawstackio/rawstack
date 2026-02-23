import Api from '@/lib/api/Api';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface PasswordResetRequestParams {
  email: string;
}

interface UsePasswordResetRequestOptions {
  onSuccess?: (email: string) => void;
  onError?: (error: unknown) => void;
}

export function useCreatePasswordResetRequest(options?: UsePasswordResetRequestOptions) {
  const { mutate, isPending } = useMutationWithCallbacks(
    (data: PasswordResetRequestParams) => Api.auth.createToken({ email: data.email }),
    {
      onSuccess: (variables) => options?.onSuccess?.(variables?.email ?? ''),
      onError: options?.onError,
    },
  );

  return { createPasswordResetRequest: mutate, isBusy: isPending };
}
