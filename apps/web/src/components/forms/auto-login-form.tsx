'use client';

import { ComponentProps, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/auth-context';

interface Props extends ComponentProps<'div'> {
  token: string;
  email: string;
  action?: string;
}

export function AutoLoginForm({ className, token, email, action }: Props) {
  const [isBusy, setIsBusy] = useState(true);
  const { login } = useAuth();
  const router = useRouter();
  const hasAttemptedLogin = useRef(false);

  useEffect(() => {
    // Prevent multiple login attempts
    if (hasAttemptedLogin.current) {
      return;
    }
    hasAttemptedLogin.current = true;

    const performAutoLogin = async () => {
      try {
        await login({ email, refreshToken: token });
        setIsBusy(false);
        toast.success('Auto login successful!');

        if (action === 'password') {
          router.push('/set-password');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Auto login failed:', error);
        setIsBusy(false);
        toast.error('Auto login failed, please login manually.');
        router.push('/login');
      }
    };

    performAutoLogin();
  }, [email, token, action, login, router]);

  return (
    <div className={cn('flex align-middle justify-center py-8', className)}>
      {isBusy ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Logging you in...</p>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Redirecting...</div>
      )}
    </div>
  );
}
