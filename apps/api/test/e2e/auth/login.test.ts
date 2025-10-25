import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GlobalHttpExceptionFilter } from '~/common/infrastructure/exception/global-http.exception-filter';
import { AppModule } from '~/app.module';
import UserProvider from '../../fixtures/user.provider';

describe('login', () => {
  let app: INestApplication;
  const userEmail = 'login@rawstack.io';

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

  test('a user can login with their password', async () => {
    await UserProvider.createUser(app, userEmail);

    const response = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: userEmail,
        password: UserProvider.defaultPassword,
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('item');

    expect(response.body.item).toHaveProperty('accessToken');
    expect(response.body.item).toHaveProperty('refreshToken');
    expect(response.body.item).toHaveProperty('ttlSeconds');
    expect(response.body.item).toHaveProperty('expiresAt');
  });

  test('a user cannot login with invalid password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: userEmail,
        password: 'some-wrong-password',
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('statusCode');
  });

  test('a user can login refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: userEmail,
        password: UserProvider.defaultPassword,
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);

    const refreshToken = response.body.item.refreshToken;

    const refreshTokenResponse = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: userEmail,
        refreshToken,
      })
      .set('Accept', 'application/json');

    expect(refreshTokenResponse.status).toBe(201);
    expect(refreshTokenResponse.body.item).toHaveProperty('accessToken');
    expect(refreshTokenResponse.body.item).toHaveProperty('refreshToken');
    expect(refreshTokenResponse.body.item).toHaveProperty('ttlSeconds');
    expect(refreshTokenResponse.body.item).toHaveProperty('expiresAt');
  });

  test('a user can login refresh token which can only be used once', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: userEmail,
        password: UserProvider.defaultPassword,
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);

    const refreshToken = response.body.item.refreshToken;

    const refreshTokenResponse1 = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: userEmail,
        refreshToken,
      })
      .set('Accept', 'application/json');

    expect(refreshTokenResponse1.status).toBe(201);

    const refreshTokenResponse2 = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: userEmail,
        refreshToken,
      })
      .set('Accept', 'application/json');

    expect(refreshTokenResponse2.status).toBe(401);
  });
});
