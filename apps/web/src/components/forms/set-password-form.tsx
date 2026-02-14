'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdatePassword } from '@/hooks/password/use-update-password';

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
  const router = useRouter();

  const { updatePassword, isBusy } = useUpdatePassword({
    onSuccess: () => {
      toast.success('Your password has been updated');
      router.push('/');
    },
    onError: (error) => {
      console.error('Password update failed:', error);
      let errorMessage = 'Failed to update password';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      toast.error(errorMessage);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    updatePassword({ password: data.password });
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
              <Button type="submit" className="w-full" disabled={isBusy || !isValid}>
                Update Password
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
