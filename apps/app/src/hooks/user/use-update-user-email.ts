import Api from '../../lib/api/Api.ts';
import { useMutationWithCallbacks, UseMutationWithCallbacksOptions } from '../use-mutation-with-callbacks.ts';

interface UpdateUserEmailParams {
  userId: string;
  email: string;
}

export function useUpdateUserEmail(options?: UseMutationWithCallbacksOptions<UpdateUserEmailParams>) {
  const { mutate, isPending } = useMutationWithCallbacks(
    (data: UpdateUserEmailParams) =>
      Api.user.updateUser(data.userId, {
        email: data.email,
      }),
    options,
  );

  return { updateUserEmail: mutate, isBusy: isPending };
}
