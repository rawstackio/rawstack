import { SetPasswordForm } from "@/components/forms/set-password-form";
import PageWrapper from "@/components/layout/page-wrapper";

export default function SetPasswordPage() {
  return (
    <PageWrapper>
      <div className={'px-6 py-6'}>
        <h1 className={'font-oswald text-3xl font-bold pb-2'}>Set Your Password</h1>
        <h2>Create your new password</h2>
      </div>
      <div className={'px-6'}>
        <SetPasswordForm />
      </div>
    </PageWrapper>
  );
}
