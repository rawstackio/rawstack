import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ComponentProps } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import Api from '@/lib/api/api.ts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Error } from '@/components/form/error';

const schema = z.object({
  email: z.string().email(),
});
type Inputs = z.TypeOf<typeof schema>;

export function PasswordResetRequestForm({ className, ...props }: ComponentProps<'div'>) {
  const createPasswordResetMutation = useMutation({
    mutationFn: (data: Inputs) => {
      return Api.auth.createToken({
        email: data.email,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(` A password reset link has been sent to ${variables.email}`);
    },
    onError: () => {
      toast.error(`Oops something went wrong`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      createPasswordResetMutation.mutate(data);
    } catch (_: unknown) {
      toast.error('Something went wrong!');
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input {...register('email')} id="email" type="email" placeholder="hi@rawstack.io" />
            {errors.email && <Error message={errors.email.message} />}
          </div>
          <div className="grid gap-2 mt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
              Reset Password
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
