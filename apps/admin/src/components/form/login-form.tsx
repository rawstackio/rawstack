import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { useAuth } from '@/lib/context/auth-context.tsx';
import { Error } from '@/components/form/error.tsx';

const schema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type Inputs = z.TypeOf<typeof schema>;

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await login(data);
    } catch (error: unknown) {
      toast.error('Something went wrong!');
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
              {errors.email && <Error message={errors.email.message} />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Password</Label>
              <Input {...register('password')} id="password" type="password" placeholder="*********" />
              {errors.password && <Error message={errors.password.message} />}
            </div>
            <div className="grid gap-2 mt-2">
              <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
                Login
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
