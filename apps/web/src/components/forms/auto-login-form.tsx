'use client';

import { ComponentProps, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAutoLogin } from '@/hooks/auth/use-auto-login';

interface Props extends ComponentProps<'div'> {
  token: string;
  email: string;
  action?: string;
}

export function AutoLoginForm({ className, token, email, action }: Props) {
  const router = useRouter();
  const hasAttemptedLogin = useRef(false);

  const { autoLogin, isBusy } = useAutoLogin({
    onSuccess: () => {
      toast.success('Auto login successful!');
      if (action === 'password') {
        router.push('/set-password');
      } else {
        router.push('/');
      }
    },
    onError: (error) => {
      console.error('Auto login failed:', error);
      toast.error('Auto login failed, please login manually.');
      router.push('/login');
    },
  });

  useEffect(() => {
    // Prevent multiple login attempts
    if (hasAttemptedLogin.current) {
      return;
    }
    hasAttemptedLogin.current = true;

    autoLogin({ email, token });
  }, [email, token, autoLogin]);

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
