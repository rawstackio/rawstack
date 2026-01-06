import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Api from '@/lib/api/api.ts';
import { Button } from '@/components/ui/button.tsx';
import { useAuth } from '@/lib/context/auth-context.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Error } from '@/components/form/error.tsx';

const schema = z
  .object({
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters',
    }),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type Inputs = z.TypeOf<typeof schema>;

interface Props {
  onSuccess: () => void;
}

export function PasswordForm({ onSuccess }: Props) {
  const { user } = useAuth();

  const updatePasswordMutation = useMutation({
    mutationFn: (data: Inputs) => {
      if (!user) {
        return Promise.reject('User not set');
      }
      return Api.user.updateUser(user.id, {
        password: data.password,
      });
    },
    onSuccess: () => {
      toast.success(`Your password has been updated`);
      onSuccess();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    updatePasswordMutation.mutate(data);
  };

  return (
    <form className={'space-y-6'} onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2 max-w-2xl">
        <label
          className={'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'}
          htmlFor="password"
        >
          Password
        </label>
        <Input type={'password'} id="password" placeholder={'new password'} {...register('password')} />
        {errors.password && <Error message={errors.password.message} />}
        <Input type={'password'} placeholder="confirm password" {...register('confirmPassword')} />
        {errors.confirmPassword && <Error message={errors.confirmPassword.message} />}
      </div>
      <div className="space-x-2 max-w-2xl">
        <Button type="submit" disabled={isSubmitting || !isValid} size="sm">
          Update Password
        </Button>
      </div>
    </form>
  );
}
