import { LoginForm } from '@/components/form/login-form.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useState } from 'react';
import Logo from '@/components/layout/logo.tsx';
import { PasswordResetRequestForm } from '@/components/form/password-reset-request-form.tsx';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AutoLogin } from '@/components/form/auto-login-form.tsx';
import { toast } from 'sonner';

export default function Login() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('password-token');
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [formType, setFormType] = useState<'login' | 'password-reset-request' | 'auto-login'>(
    token && email ? 'auto-login' : 'login',
  );

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {formType !== 'auto-login' && (
            <div className="flex flex-col items-center gap-2">
              <Logo />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          )}
          <div>
            {formType === 'login' && (
              <>
                <LoginForm />
                <Button
                  type="button"
                  className="w-full mt-3"
                  variant={'ghost'}
                  onClick={() => setFormType('password-reset-request')}
                >
                  Forgot Password
                </Button>
              </>
            )}
            {formType === 'password-reset-request' && (
              <>
                <PasswordResetRequestForm />
                <Button type="button" className="w-full mt-3" variant={'ghost'} onClick={() => setFormType('login')}>
                  Login
                </Button>
              </>
            )}
            {formType === 'auto-login' && token && email && (
              <AutoLogin
                token={token}
                email={email}
                onSuccess={() => {
                  toast.success('Auto login successful!');
                  navigate('/new-password');
                }}
                onError={() => {
                  toast.error('Auto login failed, please login manually.');
                  setFormType('login');
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
