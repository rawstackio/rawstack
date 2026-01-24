import { useState } from 'react';
import Template from '@/components/layout/template.tsx';
import UserTable from '@/components/user/user-table.tsx';
import { useListUsers } from '@/hooks/user/use-list-users.ts';

export const Users = () => {
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<{ orderBy?: 'createdAt' | 'updatedAt' | 'email'; order?: 'DESC' | 'ASC' }>({});
  const [roleFilter, setRoleFilter] = useState<'ADMIN' | 'VERIFIED_USER' | undefined>(undefined);

  const { users, pagination: userPagination } = useListUsers({
    page: pagination.page,
    perPage: pagination.perPage,
    searchQuery,
    roleFilter,
    orderBy: sortBy.orderBy,
    order: sortBy.order,
  });

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
            data={users}
            pagination={userPagination}
            onPaginationChange={(page, perPage) => {
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
