import { INestApplication } from '@nestjs/common';
import { UserModel } from '~/user/domain/model/user/user.model';
import UserProvider from './user.provider';
import * as request from 'supertest';

class TokenProvider {
  public ids: string[] = [];
  readonly defaultPassword: string = 'password1';

  async getAccessTokenTokens(
    app: INestApplication,
    user: UserModel,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: user.email.toString(),
        password: UserProvider.defaultPassword,
      })
      .set('Accept', 'application/json');

    return {
      accessToken: response.body.item.accessToken,
      refreshToken: response.body.item.refreshToken,
    };
  }
}

export default new TokenProvider();
