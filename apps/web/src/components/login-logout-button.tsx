'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import User from '@/components/icon/items/user';
import { useAuth } from '@/lib/context/auth-context';
import { AccountDropdownMenu } from '@/components/account-dropdown-menu';
import Link from 'next/link';

export function LoginLogoutButton() {
  const { user } = useAuth();
  return (
    <>
      {!user && (
        <Button variant="outline">
          <Link href="/login" className="flex items-center gap-1.5">
            <User />
            <span>Login</span>
          </Link>
        </Button>
      )}
      {user && <AccountDropdownMenu />}
    </>
  );
}
