import Api from '@/lib/api/Api';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface UpdateAccountParams {
  userId: string;
  email: string;
  password?: string;
}

export function useUpdateAccount(options?: UseMutationWithCallbacksOptions) {
  const { mutate, isPending } = useMutationWithCallbacks(
    (data: UpdateAccountParams) =>
      Api.user.updateUser(data.userId, {
        email: data.email,
        password: data.password || undefined,
      }),
    options,
  );

  return { updateAccount: mutate, isBusy: isPending };
}
