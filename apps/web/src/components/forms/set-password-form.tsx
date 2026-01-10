'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/context/auth-context';
import Api from '@/lib/api/Api';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type Inputs = z.infer<typeof schema>;

export function SetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isBusy, setIsBusy] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!user) {
      toast.error('User not authenticated');
      router.push('/login');
      return;
    }

    setIsBusy(true);
    try {
      await Api.user.updateUser(user.id, {
        password: data.password,
      });
      toast.success('Your password has been updated');
      setIsBusy(false);
      router.push('/');
    } catch (error: unknown) {
      console.error('Password update failed:', error);
      
      // Extract error message if available
      let errorMessage = 'Failed to update password';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast.error(errorMessage);
      setIsBusy(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input {...register('password')} id="password" type="password" placeholder="Enter new password" />
              {errors.password && <span className="text-sm text-destructive">{errors.password.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <span className="text-sm text-destructive">{errors.confirmPassword.message}</span>
              )}
            </div>
            <div className="grid gap-2 mt-2">
              <Button type="submit" className="w-full" disabled={isBusy}>
                Update Password
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
