import { RegistrationForm } from "@/components/forms/registration-form";
import AuthPageWrapper from "@/components/layout/auth-page-wrapper";

export default function LoginPage() {
  return (
    <AuthPageWrapper title="Create an Account">
      <RegistrationForm />
    </AuthPageWrapper>
  )
}
