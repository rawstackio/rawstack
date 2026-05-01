import { useCallback } from 'react';
import dayjs from 'dayjs';
import Api, { refreshData } from '../api/api.ts';
import LocalStorageProvider from '../storage/local-storage.ts';

export type ApiInitParams = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  email: string;
};

const useApiInit = () => {
  const onRefreshDataUpdated = useCallback((accessToken?: string, data?: refreshData) => {
    if (data) {
      LocalStorageProvider.setData('authData', {
        accessToken,
        expiresAt: dayjs(data.expiresAt).toISOString(),
        refreshToken: data.token,
        userEmail: data.email,
      });
    }
  }, []);

  const initApi = useCallback(
    ({ accessToken, refreshToken, expiresAt, email }: ApiInitParams) => {
      Api.init(
        accessToken,
        {
          token: refreshToken,
          expiresAt: dayjs(expiresAt).toDate().getTime(),
          email,
        },
        onRefreshDataUpdated,
      );
    },
    [onRefreshDataUpdated],
  );

  return { initApi };
};

export default useApiInit;

