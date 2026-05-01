import { LoginForm } from '@/components/forms/login-form';
import { AutoLoginForm } from '@/components/forms/auto-login-form';
import AuthPageWrapper from '@/components/layout/auth-page-wrapper';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string; action?: string }>;
}) {
  const { token, email, action } = await searchParams;

  return token && email ? (
    <AuthPageWrapper title="Logging you in..." skipRedirect={true}>
      <AutoLoginForm token={token} email={email} action={action} />
    </AuthPageWrapper>
  ) : (
    <AuthPageWrapper title="Login to your account">
      <LoginForm />
    </AuthPageWrapper>
  );
}
