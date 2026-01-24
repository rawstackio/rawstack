import { z } from 'zod';
import { ComponentProps, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconClipboardCopy, IconClipboardCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/auth-context.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Switch } from '@/components/ui/switch';
import { Error } from '@/components/form/error.tsx';
import { useGetUser } from '@/hooks/user/use-get-user.ts';
import { useCreateUser } from '@/hooks/user/use-create-user.ts';
import { useUpdateUser } from '@/hooks/user/use-update-user.ts';
import { useDeleteUser } from '@/hooks/user/use-delete-user.ts';
import { onError } from '@/lib/utils.ts';

const schema = z
  .object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only require confirmPassword if password has a value
      if (!data.password) return true; //
      // If password exists, confirmPassword is required and must match
      if (!data.confirmPassword) return false;
      return data.password === data.confirmPassword;
    },
    { message: 'Passwords must match', path: ['confirmPassword'] },
  );

type Inputs = z.TypeOf<typeof schema>;

interface Props extends ComponentProps<'div'> {
  userId?: string;
}

export function AccountForm({ userId }: Props) {
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const hasCopiedText = Boolean(copiedText);

  const [editPassword, setEditPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  // Mutation Hooks
  const { createUser, isBusy: isCreating } = useCreateUser({
    onSuccess: () => toast.success('User created successfully'),
    onError,
  });
  const { updateUser, isBusy: isUpdating } = useUpdateUser({
    onSuccess: () => toast.success('User updated successfully'),
    onError,
  });
  const { deleteUser, isBusy: isDeleting } = useDeleteUser({
    onSuccess: () => toast.success('User deleted successfully'),
    onError,
  });
  // Query Hooks
  const { user: accountUser } = useGetUser({ userId });

  useEffect(() => {
    if (accountUser) {
      setIsAdmin(accountUser.isAdmin);
    }
  }, [accountUser?.id]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    values: accountUser ? { email: accountUser.email } : undefined,
  });

  const isBusy = isUpdating || isCreating || isDeleting;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      if (isCreate()) {
        createUser(data);
      } else if (accountUser) {
        updateUser({ data: { ...data, isAdmin }, user: accountUser });
      }
    } catch (error: unknown) {
      console.log(error);
    }
  };

  const onDelete = async () => {
    if (userId) {
      deleteUser(userId);
    }
  };

  const isOwner = () => {
    if (!userId) {
      return false;
    }
    return userId === user?.id;
  };

  const isCreate = () => !userId;

  return (
    <form className={'space-y-6'} onSubmit={handleSubmit(onSubmit)}>
      {accountUser && (
        <div className="space-y-2 max-w-2xl">
          <label className="text-sm font-medium leading-none">Id</label>
          <div className="flex gap-2">
            <Input value={accountUser?.id} readOnly className="flex-1 font-mono text-sm" />
            <Button type={'button'} variant="outline" size="icon" onClick={() => copyToClipboard(accountUser?.id)}>
              {hasCopiedText ? <IconClipboardCheck size={16} /> : <IconClipboardCopy size={16} />}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y max-w-2xl">
        <label
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor=":r2l:-form-item"
        >
          Email
        </label>
        <Input {...register('email')} placeholder="your email" />
        {errors.email && <Error message={errors.email.message} />}
      </div>

      {accountUser && (
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <Switch id="admin-role" checked={isAdmin} onCheckedChange={setIsAdmin} disabled={isOwner()} />
            <label htmlFor="admin-role" className={`text-sm font-medium leading-none${isOwner() ? ' opacity-50' : ''}`}>
              Admin
            </label>
          </div>
        </div>
      )}

      {isOwner() && (
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <Switch
              id="password-update"
              checked={editPassword}
              onCheckedChange={(checked) => {
                setEditPassword(checked);
              }}
            />
            <label htmlFor="password-update">Update Password</label>
          </div>
          <label
            className={
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70' +
              (!editPassword ? ' opacity-30' : '')
            }
            htmlFor="password"
          >
            Password
          </label>
          <Input
            type={'password'}
            id="password"
            placeholder={'new password'}
            {...register('password')}
            disabled={!editPassword}
          />
          {errors.password && <Error message={errors.password.message} />}
          <Input
            type={'password'}
            placeholder="confirm password"
            {...register('confirmPassword')}
            disabled={!editPassword}
          />
          {errors.confirmPassword && <Error message={errors.confirmPassword.message} />}
        </div>
      )}

      <div className="space-x-2 max-w-2xl">
        {isCreate() ? (
          <Button type="submit" disabled={isBusy || !isValid} size="sm">
            Create User
          </Button>
        ) : (
          <>
            <Button type="submit" disabled={isBusy} size="sm">
              Update
            </Button>
            <Button variant="destructive" type="button" onClick={onDelete} disabled={isBusy} size="sm">
              Delete
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
