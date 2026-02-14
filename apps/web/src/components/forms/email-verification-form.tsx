'use client';

import { ComponentProps, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, ThumbsUp } from 'lucide-react';
import { useVerifyEmail } from '@/hooks/auth/use-verify-email';

interface Props extends ComponentProps<'div'> {
  token: string;
}

export function EmailVerificationForm({ className, token }: Props) {
  const { verifyEmail, isBusy, isSuccess } = useVerifyEmail();

  useEffect(() => {
    verifyEmail({ token });
  }, [token, verifyEmail]);

  const renderResult = () => {
    if (isSuccess) {
      return (
        <div className={'flex'}>
          <ThumbsUp />
          <p className={"ml-2"}>Success! your email has been verified</p>
        </div>
      );
    }
    return (
      <div className={'flex'}>
        <AlertTriangle />
        <p className={"ml-2"}>Error! Invalid token</p>
      </div>
    );
  };

  return (
    <div className={cn('flex align-middle justify-center', className)}>{isBusy ? <Spinner /> : renderResult()}</div>
  );
}
