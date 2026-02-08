import { useMutation } from '@tanstack/react-query';
import Api from '@/lib/api/Api';

interface VerifyEmailParams {
  token: string;
}

interface UseVerifyEmailOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useVerifyEmail(options?: UseVerifyEmailOptions) {
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: (data: VerifyEmailParams) => {
      return Api.auth.createActionRequest({
        token: data.token,
      });
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { verifyEmail: mutate, isBusy: isPending, isSuccess, isError };
}
