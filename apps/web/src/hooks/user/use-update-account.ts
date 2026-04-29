import { updateUser } from '@/actions/user';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface UpdateAccountParams {
  userId: string;
  email: string;
  password?: string;
}

export function useUpdateAccount(options?: UseMutationWithCallbacksOptions<UpdateAccountParams>) {
  const { mutate, isPending } = useMutationWithCallbacks(
    async (data: UpdateAccountParams) => {
      const result = await updateUser(data.userId, {
        email: data.email,
        password: data.password || undefined,
      });
      if (!result.ok) {
        const err = Object.assign(new Error(result.error.message), { statusCode: result.error.statusCode });
        throw err;
      }
      return result.user;
    },
    options,
  );

  return { updateAccount: mutate, isBusy: isPending };
}
