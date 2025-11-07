import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { Configuration, AuthenticationApi, UserApi } from '@rawstack/api-client';
import { Mutex, withTimeout } from 'async-mutex';
import { API_URL } from '../config/env';
import { ApiError } from './exception/errors';

export type refreshData = {
  token: string;
  expiresAt: number;
  email: string;
};

class Api {
  public auth!: AuthenticationApi;
  public user!: UserApi;

  private readonly axiosInstance: AxiosInstance;
  private _accessToken?: string = undefined;
  private _refreshData?: refreshData = undefined;

  public onRefreshDataUpdated?: (accessToken?: string, data?: refreshData) => void;

  protected onRequestError = (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  };

  constructor() {
    this.axiosInstance = axios.create();

    this.axiosInstance.interceptors.request.use(this.preAuthorizeRequest, this.onRequestError);

    this.axiosInstance.interceptors.response.use(
      response => response,
      async (error: AxiosError): Promise<ApiError> => {
        const statusCode = error.response ? error.response.status : 500;

        const err = new ApiError(
          statusCode,
          error?.code ?? 'UNKNOWN_ERROR',
          error.message,
          error.response?.data as { key: string },
        );

        return Promise.reject(err);
      },
    );

    this.setUpApis();
  }

  public init(
    accessToken?: string,
    refreshData?: refreshData,
    onRefreshDataUpdated?: (accessToken?: string, data?: refreshData) => void,
  ): void {
    this._refreshData = refreshData;
    this.accessToken = accessToken;
    this.onRefreshDataUpdated = onRefreshDataUpdated;
    if (this.onRefreshDataUpdated) {
      this.onRefreshDataUpdated(accessToken, refreshData);
    }
  }

  protected setUpApis() {
    const configuration = new Configuration({
      basePath: API_URL,
      accessToken: this._accessToken,
    });

    this.user = new UserApi(configuration, undefined, this.axiosInstance);
    this.auth = new AuthenticationApi(configuration, undefined, this.axiosInstance);
  }

  set accessToken(accessToken: string | undefined) {
    this._accessToken = accessToken;
    this.setUpApis();
  }

  set refreshData(data: refreshData) {
    this._refreshData = data;
  }

  private mutex = withTimeout(new Mutex(), 12000);

  protected preAuthorizeRequest = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // let non authenticated request operate as usual
    if (config.headers?.Authorization) {
      if (this.mutex.isLocked()) {
        await this.mutex.waitForUnlock();
        config.headers.Authorization = `Bearer ${this._accessToken}`;
      } else {
        if (this._accessToken && this._refreshData) {
          const timeToExpiry = this._refreshData.expiresAt - Date.now();

          if (timeToExpiry < 10_000) {
            const release = await this.mutex.acquire();
            try {
              const { data } = await this.auth.createToken({
                refreshToken: this._refreshData.token,
                email: this._refreshData.email,
              });

              if ('accessToken' in data.item) {
                const accessToken = data.item.accessToken;
                const refreshData = {
                  token: data.item.refreshToken,
                  expiresAt: new Date(data.item.expiresAt).getTime(),
                  email: this._refreshData.email,
                };
                this.refreshData = refreshData;

                if (this.onRefreshDataUpdated) {
                  this.onRefreshDataUpdated(accessToken, refreshData);
                }

                this.accessToken = accessToken;
                config.headers.Authorization = `Bearer ${accessToken}`;
              }
            } catch (e: unknown) {
              // Refresh has failed
              // clear tokens
              this._accessToken = undefined;
              this._refreshData = undefined;
              if (this.onRefreshDataUpdated) {
                this.onRefreshDataUpdated(undefined, undefined);
              }

              throw e;
            } finally {
              release();
            }
          }
        }
      }
    }

    return config;
  };
}

export default new Api();
