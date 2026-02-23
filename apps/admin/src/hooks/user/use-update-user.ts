import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';
import UserModel from '@/lib/model/user-model.ts';
import { UpdateUserRequestRolesEnum } from '@rawstack/api-client';
import { UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks.ts';

interface UpdateUserParams {
  user: UserModel;
  data: {
    email: string;
    isAdmin?: boolean;
  };
}

export function useUpdateUser(options?: UseMutationWithCallbacksOptions<UpdateUserParams>) {
  const queryClient = useQueryClient();

  const { mutate, data, isPending } = useMutation({
    mutationFn: async (data: UpdateUserParams) => {
      let existingRoles = data.user.roles;

      if (data.user.isAdmin !== data.data.isAdmin) {
        if (data.data.isAdmin) {
          existingRoles.push('ADMIN');
        } else {
          existingRoles = existingRoles.filter((role) => role !== 'ADMIN');
        }
      }

      const response = await Api.user.updateUser(data.user.id, {
        email: data.data.email,
        roles: existingRoles as UpdateUserRequestRolesEnum[],
      });

      return UserModel.createFromApiUser(response.data.item);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
      options?.onSuccess?.(variables);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { updateUser: mutate, updatedUser: data, isBusy: isPending };
}
