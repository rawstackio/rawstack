import { PasswordResetRequestForm } from "@/components/forms/password-reset-request-form";
import AuthPageWrapper from "@/components/layout/auth-page-wrapper";

export default function ResetPasswordPage() {
  return (
      <AuthPageWrapper title="Reset your password">
        <PasswordResetRequestForm />
      </AuthPageWrapper>
  )
}
