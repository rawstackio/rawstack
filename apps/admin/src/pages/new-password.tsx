import Template from '@/components/layout/template.tsx';
import { PasswordForm } from '@/components/form/password-form.tsx';
import { useNavigate } from 'react-router-dom';

export default function NewPassword() {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/');
  };

  return (
    <Template title="Dashboard">
      <div className="flex flex-1 flex-col gap-4 p-4 pl-8">
        <div className="mx-auto mt-3 mb-3 w-full max-w-6xl rounded-xl0">
          <h1 className="text-3xl">Reset Your Password</h1>
        </div>
        <div className="mx-auto w-full max-w-6xl">
          <PasswordForm onSuccess={goToDashboard} />
        </div>
      </div>
    </Template>
  );
}
