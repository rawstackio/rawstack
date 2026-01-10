'use client';

import { ComponentProps, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, ThumbsUp } from 'lucide-react';
import Api from '@/lib/api/Api';

interface Props extends ComponentProps<'div'> {
  token: string;
}

export function EmailVerificationForm({ className, token }: Props) {
  const [isBusy, setIsBusy] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Api.auth
      .createActionRequest({
        token,
      })
      .then(() => {
        setIsBusy(false);
        setSuccess(true);
      })
      .catch(() => {
        setIsBusy(false);
      });
  }, [token]);

  const renderResult = () => {
    if (success) {
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
