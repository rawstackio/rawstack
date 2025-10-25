export type TokenResponseDto =
  | {
      accessToken: string;
      ttlSeconds: number;
      expiresAt: Date;
      refreshToken: string;
    }
  | {
      action: 'CHECK_EMAIL';
    };
