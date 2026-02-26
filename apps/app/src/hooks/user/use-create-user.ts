import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';
import UserModel from '@/lib/model/user-model.ts';
import { UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks.ts';

interface CreateUserParams {
  email: string;
}

export function useCreateUser(options?: UseMutationWithCallbacksOptions<CreateUserParams>) {
  const queryClient = useQueryClient();

  const { mutate, data, isPending } = useMutation({
    mutationFn: async (data: CreateUserParams) => {
      const response = await Api.user.createUser({
        email: data.email,
      });

      return UserModel.createFromApiUser(response.data.item);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onSuccess?.(variables);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { createUser: mutate, createdUser: data, isBusy: isPending };
}
