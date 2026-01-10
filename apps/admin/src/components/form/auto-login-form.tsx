import { ComponentProps, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/auth-context.tsx';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle } from 'lucide-react';

interface Props extends ComponentProps<'div'> {
  token: string;
  email: string;
  onSuccess: () => void;
  onError: (error: unknown) => void;
}

export function AutoLogin({ className, token, email, onSuccess, onError }: Props) {
  const [isBusy, setIsBusy] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    login({ email, refreshToken: token })
      .then(() => {
        setIsBusy(false);
        onSuccess();
      })
      .catch((error: unknown) => {
        setIsBusy(false);
        onError(error);
      });
  }, [email, token]);

  return (
    <div className={cn('flex align-middle justify-center', className)}>{isBusy ? <Spinner /> : <AlertTriangle />}</div>
  );
}
