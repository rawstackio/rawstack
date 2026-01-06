import { LoaderIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

function Spinner({ className, ...props }: ComponentProps<'svg'>) {
  return <LoaderIcon role="status" aria-label="Loading" className={cn('size-6 animate-spin', className)} {...props} />;
}

export { Spinner };
