import { useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';
import UserModel from '@/lib/model/user-model.ts';

interface CreateUserParams {
  email: string;
}

interface UseCreateUserOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useCreateUser(options?: UseCreateUserOptions) {
  const queryClient = useQueryClient();

  const { mutate, data, isPending } = useMutation({
    mutationFn: async (data: CreateUserParams) => {
      const response = await Api.user.createUser({
        email: data.email,
      });

      return UserModel.createFromApiUser(response.data.item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { createUser: mutate, createdUser: data, isBusy: isPending };
}
