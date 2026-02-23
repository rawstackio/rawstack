'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ComponentProps } from 'react';
import UserModel from '@/lib/model/UserModel';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ApiError } from '@/lib/api/exception/errors';
import { toast } from 'sonner';
import { useUpdateAccount } from '@/hooks/user/use-update-account';
import { useDeleteAccount } from '@/hooks/user/use-delete-account';
import { UnverifiedEmailBanner } from '@/components/unverified-email-banner';
import { useAuth } from '@/lib/context/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Props = {
  user: UserModel;
} & ComponentProps<'div'>;

const schema = z
  .object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z.string().optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: 'Password must be at least 8 characters',
      path: ['password'],
    },
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords must match',
      path: ['confirmPassword'],
    },
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.confirmPassword && data.confirmPassword.length > 0;
      }
      return true;
    },
    {
      message: 'Please confirm your password',
      path: ['confirmPassword'],
    },
  );

type Inputs = z.infer<typeof schema>;

export const AccountForm = ({ className, user, ...props }: Props) => {
  const { logout } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const { updateAccount, isBusy } = useUpdateAccount({
    onSuccess: () => {
      toast.success('Account updated successfully');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.statusCode === 409) {
        setError('email', {
          type: 'custom',
          message: 'A user with this email already exists',
        });
      } else {
        toast.error('Something went wrong! Try again later!');
      }
    },
  });

  const { deleteAccount, isBusy: isDeleting } = useDeleteAccount({
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
    },
    onError: () => {
      toast.error('Failed to delete account. Try again later!');
    },
  });

  const onSubmit = (data: Inputs) => {
    updateAccount({
      userId: user.id,
      email: data.email,
      password: data.password || undefined,
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <UnverifiedEmailBanner user={user} />
      <div className={'border-0 bg-transparent'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                defaultValue={user.email}
                id="email"
                type="email"
                placeholder="hi@rawstack.io"
                {...register('email')}
              />
              {errors.email && <span className={'text-sm'}>{errors.email.message}</span>}
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <span className={'text-sm'}>{errors.password.message}</span>}
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Confirm Password</Label>
              </div>
              <Input id="confirm-password" type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && <span className={'text-sm'}>{errors.confirmPassword.message}</span>}
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isBusy || isDeleting || !isValid}>
                Update
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" className="w-full" variant={'outline'} disabled={isDeleting || isBusy}>
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all of your
                      data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteAccount({ userId: user.id })}>
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
