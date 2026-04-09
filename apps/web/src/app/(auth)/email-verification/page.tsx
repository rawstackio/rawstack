import AuthPageWrapper from '@/components/layout/auth-page-wrapper';
import { EmailVerificationForm } from '@/components/forms/email-verification-form';

export const dynamic = 'force-dynamic';

export default async function EmailVerificationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = params.token || '';

  return (
    <AuthPageWrapper>
      <EmailVerificationForm token={token} />
    </AuthPageWrapper>
  );
}
