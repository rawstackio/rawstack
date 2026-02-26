import { useMutation } from '@tanstack/react-query';

export interface UseMutationWithCallbacksOptions<TParams = void> {
  onSuccess?: (variables?: TParams) => void;
  onError?: (error: unknown) => void;
}

/**
 * A factory function to create mutation hooks with consistent callback handling.
 * Reduces boilerplate for simple mutations that need onSuccess/onError callbacks.
 */
export function useMutationWithCallbacks<TParams>(
  mutationFn: (params: TParams) => Promise<unknown>,
  options?: UseMutationWithCallbacksOptions<TParams>,
) {
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn,
    onSuccess: (_, variables) => {
      options?.onSuccess?.(variables);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { mutate, isPending, isSuccess, isError };
}
