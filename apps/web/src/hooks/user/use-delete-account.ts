import { deleteUser } from '@/actions/user';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface DeleteAccountParams {
  userId: string;
}

export function useDeleteAccount(options?: UseMutationWithCallbacksOptions<DeleteAccountParams>) {
  const { mutate, isPending } = useMutationWithCallbacks(
    async (data: DeleteAccountParams) => {
      const result = await deleteUser(data.userId);
      if (!result.ok) {
        const err = Object.assign(new Error(result.error.message), { statusCode: result.error.statusCode });
        throw err;
      }
    },
    options,
  );

  return { deleteAccount: mutate, isBusy: isPending };
}
