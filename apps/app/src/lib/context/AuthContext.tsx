import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import UserModel from '../model/UserModel';
import { ApiError, AuthenticationError } from '../api/exception/errors';
import LocalStorageProvider from '../storage/localStorage';
import Api, { refreshData } from '../api/Api';

interface Auth {
  user?: UserModel;
  login: (credentials: UserCredentials, user?: UserModel) => Promise<void>;
  logout: () => void;
  authModalIsOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
  getAuthItems: () => Promise<AuthData | undefined>;
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

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserModel | undefined>();
  const [authModalIsOpen, setAuthModalIsOpen] = useState<boolean>(true);

  useEffect(() => {
    const loadUserFromLocalStorage = async () => {
      const authData = await getAuthItems();

      if (!user) {
        if (authData && authData.userEmail && authData.refreshToken) {
          await login({
            email: authData.userEmail.toLowerCase(),
            refreshToken: authData.refreshToken,
          });
        }
      } else {
        if (authData) {
          Api.init(
            authData.accessToken,
            {
              token: authData.refreshToken,
              expiresAt: dayjs(authData.expiresAt).valueOf(),
              email: authData.userEmail,
            },
            storeCallback,
          );
        }
      }
    };

    loadUserFromLocalStorage();
  });

  const openAuthModal = () => {
    setAuthModalIsOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalIsOpen(false);
  };

  const storeCallback = async (accessToken?: string, data?: refreshData) => {
    if (data) {
      await LocalStorageProvider.setData('authData', {
        accessToken,
        expiresAt: dayjs(data.expiresAt).toISOString(),
        refreshToken: data.token,
        userEmail: data.email.toLowerCase(),
      });
    }
  };

  const login = async (credentials: UserCredentials, user?: UserModel) => {
    // get the tokens from the api
    const tokens = await fetchTokens({
      ...credentials,
      email: credentials.email.toLowerCase(),
    });

    Api.init(
      tokens.accessToken,
      {
        token: tokens.refreshToken,
        expiresAt: dayjs(tokens.expiresAt).valueOf(),
        email: credentials.email,
      },
      storeCallback,
    );

    if (!user) {
      user = await fetchUser();
    }
    setUser(user);
  };

  const logout = async () => {
    await storeAuthItems();
    Api.init(undefined, undefined, undefined);
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

    try {
      const response = await Api.auth.createToken(requestBody);

      if ('accessToken' in response.data.item) {
        return {
          accessToken: response.data.item.accessToken,
          expiresAt: response.data.item.expiresAt,
          refreshToken: response.data.item.refreshToken,
          userEmail: credentials.email,
        };
      } else {
        throw new AuthenticationError('Could not fetch tokens', 'INVALID_CREDENTIALS');
      }
    } catch (e: unknown) {
      const isRefresh = 'refreshToken' in credentials;
      if (isRefresh) {
        await storeAuthItems();
      }
      if (e instanceof ApiError && e.statusCode === 401) {
        throw new AuthenticationError(e.message, 'INVALID_CREDENTIALS');
      }
      throw new Error('unknown error');
    }
  };

  const refreshUser = async () => {
    const user = await fetchUser();
    setUser(user);
  };

  const fetchUser = async (): Promise<UserModel> => {
    try {
      const response = await Api.user.getCurrentUser();

      return UserModel.createFromApiUser(response.data.item);
    } catch (error) {
      throw new AuthenticationError('Could not fetch user', 'USER_NOT_FOUND');
    }
  };

  const storeAuthItems = async (user?: UserModel, accessTokens?: AuthData) => {
    await LocalStorageProvider.setData('authData', accessTokens);

    setUser(user);
  };

  const getAuthItems = async (): Promise<AuthData | undefined> => {
    return await LocalStorageProvider.getData('authData');
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        user,
        authModalIsOpen,
        openAuthModal,
        closeAuthModal,
        refreshUser,
        getAuthItems,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
