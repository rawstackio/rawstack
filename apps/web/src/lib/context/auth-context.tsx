'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import UserModel from '../model/user-model';
import { type User } from '@rawstack/api-client';
import { ApiError, AuthenticationError } from '../api/exception/errors';
import { login, autoLogin, logout as logoutAction, getMe } from '@/actions/auth';

interface Auth {
  user?: UserModel;
  login: (credentials: UserCredentials) => Promise<void>;
  logout: () => Promise<void>;
  authModalIsOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
}

export type UserCredentials =
  | { email: string; password: string }
  | { email: string; refreshToken: string };

export const AuthContext = createContext({} as Auth);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserModel | undefined>();
  const [authModalIsOpen, setAuthModalIsOpen] = useState<boolean>(true);

  useEffect(() => {
    getMe()
      .then((u) => { if (u) setUser(UserModel.createFromApiUser(u)); })
      .catch(() => {});
  }, []);

  const openAuthModal = () => setAuthModalIsOpen(true);
  const closeAuthModal = () => setAuthModalIsOpen(false);

  const handleLogin = async (credentials: UserCredentials) => {
    try {
      const u: User =
        'refreshToken' in credentials
          ? await autoLogin(credentials.email, credentials.refreshToken)
          : await login(credentials.email, credentials.password);
      setUser(UserModel.createFromApiUser(u));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        throw new AuthenticationError(err.message, 'INVALID_CREDENTIALS');
      }
      throw err;
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    setUser(undefined);
  };

  const refreshUser = async () => {
    const u = await getMe();
    setUser(u ? UserModel.createFromApiUser(u) : undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        login: handleLogin,
        logout: handleLogout,
        user,
        authModalIsOpen,
        openAuthModal,
        closeAuthModal,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
