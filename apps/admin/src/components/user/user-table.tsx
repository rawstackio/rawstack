import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconPencil,
  IconUserCircle,
  IconArrowUp,
  IconArrowDown,
  IconFilter,
} from '@tabler/icons-react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Input } from '@/components/ui/input.tsx';
import { PlusIcon } from 'lucide-react';
import UserModel from '@/lib/model/user-model.ts';
import { useApp } from '@/lib/context/app-context.tsx';

type OrderBy = 'createdAt' | 'updatedAt' | 'email';
type Order = 'DESC' | 'ASC';

interface Props {
  data: UserModel[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
  onPaginationChange: (page: number, perPage: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: { orderBy?: OrderBy; order?: Order };
  onSortChange: (sort: { orderBy?: OrderBy; order?: Order }) => void;
  roleFilter?: 'ADMIN' | 'VERIFIED_USER';
  onRoleFilterChange: (role: 'ADMIN' | 'VERIFIED_USER' | undefined) => void;
}

const UserTable = ({
  data,
  pagination,
  onPaginationChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  roleFilter,
  onRoleFilterChange,
}: Props) => {
  const { setDrawerAction } = useApp();

  const handleSort = (columnKey: OrderBy) => {
    if (sortBy.orderBy === columnKey) {
      // Toggle between ASC, DESC, and no sort
      if (sortBy.order === 'ASC') {
        onSortChange({ orderBy: columnKey, order: 'DESC' });
      } else if (sortBy.order === 'DESC') {
        onSortChange({});
      }
    } else {
      onSortChange({ orderBy: columnKey, order: 'ASC' });
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy.orderBy !== columnKey) return null;
    return sortBy.order === 'ASC' ? <IconArrowUp size={16} /> : <IconArrowDown size={16} />;
  };

  const columns: ColumnDef<UserModel>[] = [
    {
      header: ' ',
      cell: () => (
        <div>
          <IconUserCircle />
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ cell }) => <div className="w-32">{cell.getValue<string>()}</div>,
      enableSorting: true,
    },
    {
      header: 'Status',
      accessorKey: 'isVerified',
      cell: ({ cell }) => {
        const isVerified = cell.getValue<boolean>();
        return (
          <Badge variant={isVerified ? 'default' : 'secondary'} className="px-1.5">
            {isVerified ? 'Verified' : 'Unverified'}
          </Badge>
        );
      },
    },
    {
      header: 'Roles',
      accessorKey: 'roles',
      cell: ({ cell }) => {
        const roles = cell.getValue<string[]>();
        return (
          <div className="flex gap-1">
            {roles.map((role) => (
              <Badge key={role} variant="outline" className="text-muted-foreground px-1.5">
                {role}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'dateCreated',
      header: 'Joined',
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.dateCreated.format('YYYY-MM-DD')}</div>,
      enableSorting: true,
    },
    {
      accessorKey: 'unverifiedEmail',
      header: 'Unverified Email',
      cell: ({ cell }) => <div className="w-32">{cell.getValue<string>()}</div>,
    },
    {
      id: 'actions',
      header: '',
      accessorKey: 'id',
      cell: ({ cell }) => {
        return (
          <div className="text-right">
            <Button
              onClick={() => addUser(cell.getValue<string>())}
              variant="ghost"
              size="sm"
            >
              <IconPencil size={16} />
              Edit
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.perPage,
      },
    },
    getRowId: (row) => row.id.toString(),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: pagination.totalItems,
  });

  const addUser = (userId?: string) => {
    setDrawerAction({ form: 'account', entityId: userId ?? null });
  };

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between pb-4 gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-48"
          />
          <Select
            value={roleFilter || 'all'}
            onValueChange={(value) =>
              onRoleFilterChange(value === 'all' ? undefined : (value as 'ADMIN' | 'VERIFIED_USER'))
            }
          >
            <SelectTrigger className="w-[180px]">
              <IconFilter size={16} className="mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin Only</SelectItem>
              <SelectItem value="VERIFIED_USER">Verified Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => addUser()}>
          <PlusIcon />
          <span className="hidden lg:inline">Add User</span>
        </Button>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnKey = header.column.id;
                    const isSortable = columnKey === 'email' || columnKey === 'dateCreated';
                    // Map column id to API orderBy value
                    const orderByKey =
                      columnKey === 'dateCreated' ? 'createdAt' : columnKey === 'email' ? 'email' : undefined;

                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : isSortable && orderByKey ? (
                          <button
                            onClick={() => handleSort(orderByKey as OrderBy)}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {renderSortIcon(orderByKey)}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="h-14">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  onPaginationChange(pagination.page, Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium pl-4">
              Page {table.getState().pagination.pageIndex + 1} of {pagination.totalPages}{' '}
            </div>
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  onPaginationChange(1, pagination.perPage);
                }}
                disabled={pagination.page === 1}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  onPaginationChange(pagination.page - 1, pagination.perPage);
                }}
                disabled={pagination.page === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  onPaginationChange(pagination.page + 1, pagination.perPage);
                }}
                disabled={!(pagination.totalPages > pagination.page)}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => {
                  onPaginationChange(pagination.totalPages, pagination.perPage);
                }}
                disabled={!(pagination.totalPages > pagination.page)}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
