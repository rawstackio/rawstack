import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import UserModel from '../model/user-model.ts';
import dayjs from 'dayjs';
import { AuthenticationError } from '../api/exception/errors.ts';
import LocalStorageProvider from '../storage/local-storage.ts';
import Api, { refreshData } from '../api/api.ts';

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
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  userEmail: string;
};

export const AuthContext = createContext({} as Auth);

const AuthProvider = ({ children }: Props) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [user, setUser] = useState<UserModel | undefined>();

  let isMounting = false;

  useEffect(() => {
    const loadUserFromLocalStorage = async () => {
      if (!user && !isMounting) {
        isMounting = true;
        const authData = await getAuthItems();

        if (authData && authData.userEmail && authData.refreshToken) {
          await login({
            email: authData.userEmail,
            refreshToken: authData.refreshToken,
          });
        }

        isMounting = false;
        setLoaded(true);
      }
    };

    loadUserFromLocalStorage();
  }, [user]);

  const login = async (credentials: UserCredentials, user?: UserModel) => {
    const tokens = await fetchTokens(credentials);

    if (!user) {
      user = await fetchUser();
    }

    if (!user.isAdmin) {
      throw new AuthenticationError('User does not have admin access', 'INVALID_CREDENTIALS');
    }

    await storeAuthItems(user, {
      accessToken: tokens.accessToken,
      expiresAt: tokens.expiresAt,
      refreshToken: tokens.refreshToken,
      userEmail: credentials.email,
    });
  };

  const logout = async () => {
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
            password: credentials?.password,
          }
        : {
            email: credentials.email.toLowerCase(),
            refreshToken: credentials.refreshToken,
          };

    const { data, status } = await Api.auth.createToken(requestBody);

    if (status === 201 && 'accessToken' in data.item && data.item.accessToken) {
      Api.init(
        data.item.accessToken,
        {
          token: data.item.refreshToken,
          expiresAt: dayjs(data.item.expiresAt).toDate().getTime(),
          email: credentials.email,
        },
        (accessToken?: string, data?: refreshData) => {
          if (data) {
            LocalStorageProvider.setData('authData', {
              accessToken,
              expiresAt: dayjs(data.expiresAt).toISOString(),
              refreshToken: data.token,
              userEmail: data.email,
            });
          }
        },
      );

      return {
        accessToken: data.item.accessToken,
        expiresAt: data.item.expiresAt,
        refreshToken: data.item.refreshToken,
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

  const storeAuthItems = async (user?: UserModel, accessTokens?: AuthData) => {
    LocalStorageProvider.setData('authData', accessTokens);
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
