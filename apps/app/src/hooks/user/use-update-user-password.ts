import Api from '../../lib/api/Api.ts';
import { useMutationWithCallbacks, UseMutationWithCallbacksOptions } from '../use-mutation-with-callbacks.ts';

interface UpdateUserPasswordParams {
  userId: string;
  password: string;
}

export function useUpdateUserPassword(options?: UseMutationWithCallbacksOptions<UpdateUserPasswordParams>) {
  const { mutate, isPending } = useMutationWithCallbacks(
    (data: UpdateUserPasswordParams) =>
      Api.user.updateUser(data.userId, {
        password: data.password,
      }),
    options,
  );

  return { updateUserPassword: mutate, isBusy: isPending };
}
