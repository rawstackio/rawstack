'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useResendVerificationEmail } from '@/hooks/user/use-resend-verification-email';
import UserModel from '@/lib/model/UserModel';

type Props = {
  user: UserModel;
};

export const UnverifiedEmailBanner = ({ user }: Props) => {
  const { resendVerificationEmail, isBusy } = useResendVerificationEmail({
    onSuccess: () => {
      toast.success('Verification email sent');
    },
    onError: () => {
      toast.error('Failed to resend verification email');
    },
  });

  if (!user.unverifiedEmail) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      <p>Your email address is unverified. Please check your inbox for a verification link.</p>
      <Button
        type="button"
        size="sm"
        className="shrink-0 bg-yellow-700 text-white hover:bg-yellow-800"
        disabled={isBusy}
        onClick={() =>
          resendVerificationEmail({ userId: user.id, unverifiedEmail: user.unverifiedEmail! })
        }
      >
        Resend email
      </Button>
    </div>
  );
};
