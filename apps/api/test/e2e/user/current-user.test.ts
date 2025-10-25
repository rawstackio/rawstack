import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GlobalHttpExceptionFilter } from '~/common/infrastructure/exception/global-http.exception-filter';
import { AppModule } from '~/app.module';
import UserProvider from '../../fixtures/user.provider';
import TokenProvider from '../../fixtures/token.provider';

describe('current user', () => {
  let app: INestApplication;
  const userEmail = 'current-user@rawstack.io';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalHttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await UserProvider.deleteUsers(app, [userEmail]);
    await app.close();
  });

  test('a logged in user can get the current user', async () => {
    const user = await UserProvider.createUser(app, userEmail);
    const tokens = await TokenProvider.getAccessTokenTokens(app, user);
    const accessToken = tokens.accessToken;

    const currentUserResponse = await request(app.getHttpServer())
      .get('/user/users/current')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(currentUserResponse.status).toBe(200);
    expect(currentUserResponse.body).toHaveProperty('item');

    expect(currentUserResponse.body.item.id).toBe(user.id);
    expect(currentUserResponse.body.item.email).toBe(userEmail);
    expect(currentUserResponse.body.item.unverifiedEmail).toBe(userEmail);
    expect(currentUserResponse.body.item.roles).toEqual([]);
  });

  test('anon user can not get the current user', async () => {
    const currentUserResponse = await request(app.getHttpServer())
      .get('/user/users/current')
      .set('Accept', 'application/json');

    expect(currentUserResponse.status).toBe(401);
  });
});
