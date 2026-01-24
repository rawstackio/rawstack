import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';
import UserModel from '@/lib/model/user-model.ts';

interface UseListUsersParams {
  page: number;
  perPage: number;
  searchQuery?: string;
  roleFilter?: 'ADMIN' | 'VERIFIED_USER';
  orderBy?: 'createdAt' | 'updatedAt' | 'email';
  order?: 'DESC' | 'ASC';
}

export function useListUsers({ page, perPage, searchQuery, roleFilter, orderBy, order }: UseListUsersParams) {
  const { data, isPending } = useQuery({
    queryKey: ['users', page, perPage, searchQuery, orderBy, order, roleFilter],
    queryFn: async () => {
      const data = await Api.user.listUsers(page, perPage, searchQuery || undefined, roleFilter, orderBy, order);
      return data.data;
    },
    select: (data) => {
      const totalItems = data.meta.pagination.totalItems;
      const perPage = data.meta.pagination.perPage;
      const totalPages = Math.ceil(totalItems / perPage);

      return {
        page: data.meta.pagination.page,
        perPage,
        totalPages,
        totalItems,
        items: data.items.map((item) => UserModel.createFromApiUser(item)),
      };
    },
    placeholderData: keepPreviousData,
  });

  const pagination = {
    page: data ? data.page : page,
    perPage: data ? data.perPage : perPage,
    totalPages: data ? data.totalPages : 0,
    totalItems: data ? data.totalItems : 0,
  };

  return { users: data?.items, pagination, isBusy: isPending };
}
