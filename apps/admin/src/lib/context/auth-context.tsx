import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import UserModel from '../model/user-model.ts';
import { AuthenticationError } from '../api/exception/errors.ts';
import LocalStorageProvider from '../storage/local-storage.ts';
import Api from '../api/api.ts';
import useApiInit from '../hooks/use-api-init.ts';

interface Props {
  children: ReactNode;
  restrictRole?: string;
}

interface Auth {
  loaded: boolean;
  user?: UserModel;
  login: (credentials: UserCredentials, user?: UserModel) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export type UserCredentials =
  | {
      email: string;
      password: string;
    }
  | {
      email: string;
      refreshToken: string;
    };

export type AuthData = {
  expiresAt: string;
  userEmail: string;
};

export const AuthContext = createContext({} as Auth);

const AuthProvider = ({ children }: Props) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [user, setUser] = useState<UserModel | undefined>();
  const { initApi } = useApiInit();

  let isMounting = false;

  useEffect(() => {
    const loadUserFromStorage = async () => {
      if (!user && !isMounting) {
        isMounting = true;
        const authData = await getAuthItems();

        if (authData?.userEmail) {
          try {
            await restoreSession(authData.userEmail);
          } catch {
            await storeAuthItems();
          }
        }

        isMounting = false;
        setLoaded(true);
      }
    };

    void loadUserFromStorage();
  }, [user]);

  const restoreSession = async (email: string): Promise<void> => {
    const { data, status } = await Api.auth.createToken({ email });

    if (status === 201 && 'accessToken' in data.item && data.item.accessToken) {
      initApi({
        accessToken: data.item.accessToken,
        expiresAt: data.item.expiresAt,
        email,
      });

      const fetchedUser = await fetchUser();
      if (fetchedUser.isAdmin) {
        setUser(fetchedUser);
        await storeAuthItems(fetchedUser, { expiresAt: data.item.expiresAt, userEmail: email });
        return;
      }

      await storeAuthItems();
      throw new AuthenticationError('User does not have admin access', 'INVALID_CREDENTIALS');
    }

    throw new AuthenticationError('Session restore failed', 'INVALID_CREDENTIALS');
  };

  const login = async (credentials: UserCredentials, user?: UserModel) => {
    const tokens = await fetchTokens(credentials);

    if (!user) {
      user = await fetchUser();
    }

    if (!user.isAdmin) {
      throw new AuthenticationError('User does not have admin access', 'INVALID_CREDENTIALS');
    }

    await storeAuthItems(user, {
      expiresAt: tokens.expiresAt,
      userEmail: credentials.email,
    });
  };

  const logout = async () => {
    try {
      await Api.auth.deleteRefreshTokenCookies();
    } catch {
      // proceed with local logout even if the server call fails
    }
    await storeAuthItems();
  };

  const requestPasswordReset = async (email: string) => {
    await Api.auth.createToken({ email });
  };

  const fetchTokens = async (credentials: UserCredentials): Promise<AuthData> => {
    const requestBody =
      'password' in credentials
        ? {
            email: credentials.email.toLowerCase(),
            password: credentials.password,
          }
        : {
            email: credentials.email.toLowerCase(),
            refreshToken: credentials.refreshToken,
          };

    const { data, status } = await Api.auth.createToken(requestBody);

    if (status === 201 && 'accessToken' in data.item && data.item.accessToken) {
      initApi({
        accessToken: data.item.accessToken,
        expiresAt: data.item.expiresAt,
        email: credentials.email,
      });

      return {
        expiresAt: data.item.expiresAt,
        userEmail: credentials.email,
      };
    }

    const isRefresh = 'refreshToken' in credentials;
    if (isRefresh) {
      await storeAuthItems();
    }

    throw new AuthenticationError(
      !isRefresh ? 'invalid username or password' : 'invalid refresh token',
      'INVALID_CREDENTIALS',
    );
  };

  const refreshUser = async () => {
    const user = await fetchUser();
    setUser(user);
  };

  const fetchUser = async (): Promise<UserModel> => {
    const { data: userBody, status: userStatus } = await Api.user.getCurrentUser();

    if (userStatus === 200) {
      return UserModel.createFromApiUser(userBody.item);
    }

    throw new AuthenticationError('Could not fetch user', 'USER_NOT_FOUND');
  };

  const storeAuthItems = async (user?: UserModel, authData?: AuthData) => {
    LocalStorageProvider.setData('authData', authData);
    setUser(user);
  };

  const getAuthItems = async (): Promise<AuthData | undefined> => {
    return LocalStorageProvider.getData('authData');
  };

  return (
    <AuthContext.Provider
      value={{
        loaded,
        login,
        logout,
        requestPasswordReset,
        user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
