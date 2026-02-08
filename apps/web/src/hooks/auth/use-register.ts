import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/context/auth-context';
import Api from '@/lib/api/Api';
import UserModel from '@/lib/model/UserModel';

interface RegisterParams {
  email: string;
  password: string;
}

interface UseRegisterOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useRegister(options?: UseRegisterOptions) {
  const { login } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: RegisterParams) => {
      const response = await Api.user.createUser({
        email: data.email.toLowerCase(),
        password: data.password,
      });

      const user = UserModel.createFromApiUser(response.data.item);
      await login({ email: data.email, password: data.password }, user);

      return user;
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { register: mutate, isBusy: isPending };
}
