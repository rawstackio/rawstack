import { useMutation } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';

interface PasswordResetRequestParams {
  email: string;
}

interface UsePasswordResetRequestOptions {
  onSuccess?: (email: string) => void;
  onError?: (error: unknown) => void;
}

export function useCreatePasswordResetRequest(options?: UsePasswordResetRequestOptions) {
  const { mutate, isPending } = useMutation({
    mutationFn: (data: PasswordResetRequestParams) => {
      return Api.auth.createToken({
        email: data.email,
      });
    },
    onSuccess: (_, variables) => {
      options?.onSuccess?.(variables.email);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { createPasswordResetRequest: mutate, isBusy: isPending };
}
