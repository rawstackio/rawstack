import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { Button } from '@/components/ui/button';
import { ComponentProps, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context.tsx';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input.tsx';
import Api from '@/lib/api/api.ts';
import { Switch } from '@/components/ui/switch';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import UserModel from '@/lib/model/user-model.ts';
import { Toggle } from '@/components/ui/toggle.tsx';
import { Error } from '@/components/form/error.tsx';

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

  const [isBusy, setIsBusy] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (data: Inputs) => {
      return Api.user.createUser({
        email: data.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User created successfully`);
    },
    onError: () => {
      toast.error(`Oops something went wrong`);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: Inputs) => {
      if (!userId) {
        return Promise.reject('User ID not set');
      }

      return Api.user.updateUser(userId, {
        email: data.email,
        roles,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User updated successfully`);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('mutationFn deleteUser', id);
      return await Api.user.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User deleted successfully`);
    },
  });

  const { data: accountUser } = useQuery({
    queryKey: ['user', `${userId === user?.id ? 'current' : userId}`],
    queryFn: () => {
      if (!userId) {
        return Promise.reject('User ID not set');
      }
      return Api.user.getUser(userId);
    },
    select: (data) => {
      return UserModel.createFromApiUser(data.data.item);
    },
    onSuccess: (user: UserModel) => {
      const initialRoles: string[] = [];
      if (user.isAdmin) initialRoles.push('ADMIN');
      if (user.isVerified) initialRoles.push('VERIFIED_USER');
      setRoles(initialRoles);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsBusy(true);
    try {
      console.log(data);

      // isCreate
      if (isCreate()) {
        createUserMutation.mutate(data);
      } else {
        updateUserMutation.mutate(data);
      }
    } catch (error: unknown) {
      console.log(error);
    }
    setIsBusy(false);
  };

  const onDelete = async () => {
    if (userId) {
      deleteUserMutation.mutate(userId);
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
        <div className="space-y max-w-2xl">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor=":r2l:-form-item"
          >
            Id
          </label>
          <div>
            <Input value={accountUser?.id} />
            <Button type={'button'} variant="outline" size="icon" onClick={() => copyToClipboard(accountUser?.id)}>
              {hasCopiedText ? <CopyIcon /> : <CheckIcon />}
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
        <Input {...register('email')} placeholder="your email" defaultValue={accountUser?.email} />
        {errors.email && <Error message={errors.email.message} />}
      </div>

      <div className="space-y max-w-2xl">
        <div>
          <Toggle
            defaultPressed={accountUser?.isVerified}
            aria-label="Toggle Verified User Role"
            size="sm"
            variant="outline"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
            onPressedChange={(pressed) => {
              // Handle admin state change
              console.log('Verified User:', pressed);

              if (pressed) {
                setRoles((prevRoles) => [...prevRoles, 'VERIFIED_USER']);
              } else {
                setRoles((prevRoles) => prevRoles.filter((role) => role !== 'VERIFIED_USER'));
              }
            }}
          >
            <CheckIcon />
            Verified User
          </Toggle>
          <Toggle
            aria-label="Toggle Admin Role"
            defaultPressed={accountUser?.isAdmin}
            size="sm"
            variant="outline"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
            onPressedChange={(pressed) => {
              // Handle admin state change
              console.log('Admin:', pressed);

              if (pressed) {
                setRoles((prevRoles) => [...prevRoles, 'ADMIN']);
              } else {
                setRoles((prevRoles) => prevRoles.filter((role) => role !== 'ADMIN'));
              }
            }}
          >
            <CheckIcon />
            Admin
          </Toggle>
        </div>
      </div>

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
