import { useQuery } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';
import UserModel from '@/lib/model/user-model.ts';
import { useAuth } from '@/lib/context/auth-context.tsx';

interface UseGetUserParams {
  userId?: string;
}

export function useGetUser({ userId }: UseGetUserParams) {
  const { user: currentUser } = useAuth();

  const { data, isPending } = useQuery({
    queryKey: ['user', `${userId === currentUser?.id ? 'current' : userId}`],
    queryFn: () => {
      if (!userId) {
        return Promise.reject('User ID not set');
      }
      return Api.user.getUser(userId);
    },
    select: (data) => {
      return UserModel.createFromApiUser(data.data.item);
    },
    enabled: !!userId,
  });

  return { user: data, isBusy: isPending };
}
