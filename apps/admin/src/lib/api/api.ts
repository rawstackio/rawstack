import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Configuration, AuthenticationApi, UserApi } from '@rawstack/api-client';
import { Mutex, withTimeout } from 'async-mutex';
import { AuthenticationError, ValidationError } from './exception/errors.ts';

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
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_URL ?? '',
    });

    this.axiosInstance.interceptors.request.use(this.preAuthorizeRequest, this.onRequestError);

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log(error);
        if (error.response && error.response.status === 400) {
          throw ValidationError.fromApiResponse(error.response.data);
        }
        if (error.response && error.response.status === 401) {
          throw new AuthenticationError('Validation failed', 'INVALID_CREDENTIALS');
        }
        return Promise.reject(error);
      },
    );

    this.setUpApis();
  }

  public init(
    accessToken?: string,
    refreshData?: refreshData,
    onRefreshDataUpdated?: (accessToken?: string, data?: refreshData) => void,
  ): void {
    this.accessToken = accessToken;
    this._refreshData = refreshData;
    this.onRefreshDataUpdated = onRefreshDataUpdated;
  }

  protected setUpApis() {
    const configuration = new Configuration({
      basePath: import.meta.env.VITE_API_URL ?? '',
      accessToken: this._accessToken,
    });

    this.auth = new AuthenticationApi(configuration, undefined, this.axiosInstance);
    this.user = new UserApi(configuration, undefined, this.axiosInstance);
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
    // let no authenticated request operate as usual
    if (config.headers?.Authorization) {
      // if the mutex is locked hold the request here. is that possible....
      if (this.mutex.isLocked()) {
        await this.mutex.waitForUnlock();
        config.headers['Authorization'] = `Bearer ${this._accessToken}`;
      } else {
        if (this._accessToken && this._refreshData) {
          const timeToExpiry = this._refreshData.expiresAt - Date.now();

          if (timeToExpiry < 3000) {
            const release = await this.mutex.acquire();
            try {
              const { data } = await this.auth.createToken({
                refreshToken: this._refreshData.token,
                email: this._refreshData.email,
              });

              if ('accessToken' in data.item) {
                const refreshData = {
                  token: data.item.refreshToken,
                  expiresAt: new Date(data.item.expiresAt).getTime(),
                  email: this._refreshData.email,
                };
                this.refreshData = refreshData;

                if (this.onRefreshDataUpdated) {
                  this.onRefreshDataUpdated(this._accessToken, refreshData);
                }

                this.accessToken = data.item.accessToken;
                config.headers['Authorization'] = `Bearer ${this._accessToken}`;
              }
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
