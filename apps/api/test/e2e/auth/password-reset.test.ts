import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GlobalHttpExceptionFilter } from '~/common/infrastructure/exception/global-http.exception-filter';
import { AppModule } from '~/app.module';
import UserProvider from '../../fixtures/user.provider';

describe('password reset', () => {
  let app: INestApplication;
  const userEmail = 'password-reset@rawstack.io';

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

  test('an existing user can request to reset password', async () => {
    const user = await UserProvider.createUser(app, userEmail);

    const response = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: userEmail,
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('item');
    expect(response.body.item.action).toBe('CHECK_EMAIL');

    // @todo: we need to actually test that the event was sent to event bridge
    // @todo: inpect the contents of the token
    // @todo: test using the token
  });

  test('a non existing user will appear to have successfully requested a password reset', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({
        email: 'some-email@rawstack.io',
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('item');
    expect(response.body.item.action).toBe('CHECK_EMAIL');

    // @todo: we need to actually test that the event was sent to event bridge
    // @todo: inpect the contents of the token
    // @todo: test using the token
  });
});
