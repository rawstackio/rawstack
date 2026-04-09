'use client';

import { LoginForm } from '@/components/forms/login-form';
import { AutoLoginForm } from '@/components/forms/auto-login-form';
import AuthPageWrapper from '@/components/layout/auth-page-wrapper';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const action = searchParams.get('action');

  // If we have token and email, use auto-login
  const shouldAutoLogin = token && email;

  return (
    <AuthPageWrapper
      title={shouldAutoLogin ? 'Logging you in...' : 'Login to your account'}
      skipRedirect={!!shouldAutoLogin}
    >
      {shouldAutoLogin ? <AutoLoginForm token={token} email={email} action={action || undefined} /> : <LoginForm />}
    </AuthPageWrapper>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthPageWrapper title="Loading..." skipRedirect={true}>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AuthPageWrapper>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
