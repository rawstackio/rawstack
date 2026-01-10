import Template from '@/components/layout/template.tsx';

import Api from '@/lib/api/api.ts';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import UserModel from '@/lib/model/user-model.ts';
import UserTable from '@/components/user/user-table.tsx';
import { useState } from 'react';

export const Users = () => {
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<{ orderBy?: string; order?: 'asc' | 'desc' }>({});
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  // const [perPage, setPerPage] = useState(10);

  const {
    // isPending,
    // isError,
    data: users,
    // error,
  } = useQuery({
    queryKey: ['users', pagination.page, pagination.perPage, searchQuery, sortBy.orderBy, sortBy.order, roleFilter],
    queryFn: async () => {
      console.log('fetching users.....');
      const data = await Api.user.listUsers(
        pagination.page,
        pagination.perPage,
        searchQuery || undefined,
        sortBy.orderBy,
        sortBy.order,
        roleFilter,
      );
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
    placeholderData: keepPreviousData, // don't have 0 rows flash while changing pages/loading next page
  });

  console.log({ users });
  if (!users) {
    return <div>Loading...</div>;
  }

  return (
    <Template title="Users">
      <div className="flex flex-1 flex-col gap-4 p-4 pl-8">
        <div className="mx-auto mt-3 mb-3 w-full max-w-6xl rounded-xl0">
          <h1 className="text-3xl">Rawstack Users</h1>
          <p className="text-muted-foreground">Manage your users here</p>
        </div>
        <div className="mx-auto w-full max-w-6xl">
          <UserTable
            data={users.items}
            pagination={{
              page: users.page,
              perPage: users.perPage,
              totalPages: users.totalPages,
              totalItems: users.totalItems,
            }}
            onPaginationChange={(page, perPage) => {
              console.log({ page, perPage });
              setPagination({ page, perPage });
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
          />
        </div>
      </div>
    </Template>
  );
};
