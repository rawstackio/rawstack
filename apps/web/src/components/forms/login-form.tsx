'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/context/auth-context';
import { AuthenticationError } from '@/lib/api/exception/errors';

const schema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').min(1, 'Password is required'),
});

type Inputs = z.infer<typeof schema>;

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isBusy, setIsBusy] = useState(false);
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsBusy(true);
    try {
      await login(data);
      setIsBusy(false);
    } catch (error: unknown) {
      if (error instanceof AuthenticationError) {
        console.log({ error });
        // setFormErrors([error.message]);
      }
      setIsBusy(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input {...register('email')} id="email" type="email" placeholder="hi@rawstack.io" />
              {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="*********" {...register('password')} />
              {errors.password && <span className="text-sm text-destructive">{errors.password.message}</span>}
            </div>
            <div className="grid gap-2 mt-2">
              <Button type="submit" className="w-full" disabled={isBusy}>
                Login
              </Button>
            </div>
          </div>
        </div>
      </form>
      <Button
        type="button"
        className="w-full"
        variant={'ghost'}
        asChild
      >
        <Link href="/reset-password">Forgot Password</Link>
      </Button>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}
