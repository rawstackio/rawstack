import { useCallback } from 'react';
import dayjs from 'dayjs';
import Api, { refreshData } from '../api/api.ts';
import LocalStorageProvider from '../storage/local-storage.ts';

export type ApiInitParams = {
  accessToken: string;
  expiresAt: string;
  email: string;
};

const useApiInit = () => {
  const onRefreshDataUpdated = useCallback((_accessToken?: string, data?: refreshData) => {
    if (data) {
      LocalStorageProvider.setData('authData', {
        expiresAt: dayjs(data.expiresAt).toISOString(),
        userEmail: data.email,
      });
    }
  }, []);

  const initApi = useCallback(
    ({ accessToken, expiresAt, email }: ApiInitParams) => {
      Api.init(
        accessToken,
        {
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
