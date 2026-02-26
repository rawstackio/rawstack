import Api from '@/lib/api/Api';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface DeleteAccountParams {
  userId: string;
}

export function useDeleteAccount(options?: UseMutationWithCallbacksOptions<DeleteAccountParams>) {
  const { mutate, isPending } = useMutationWithCallbacks(
    (data: DeleteAccountParams) => Api.user.deleteUser(data.userId),
    options,
  );

  return { deleteAccount: mutate, isBusy: isPending };
}
