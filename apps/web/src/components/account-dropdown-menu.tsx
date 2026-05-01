'use client';

import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import Logout from '@/components/icon/items/logout';
import Settings from '@/components/icon/items/settings';
import { useAuth } from '@/lib/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';

const PROTECTED_ROUTES = ['/account'];

export function AccountDropdownMenu() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
      router.replace('/');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarFallback>RS</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link href={'/account'} className={'flex items-center gap-1.5'}>
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <Logout /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
