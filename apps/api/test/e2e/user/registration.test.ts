import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GlobalHttpExceptionFilter } from '~/common/infrastructure/exception/global-http.exception-filter';
import { AppModule } from '~/app.module';
import UserProvider from '../../fixtures/user.provider';

describe('Creating Users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await UserProvider.deleteUsers(app, ['new@user.com']);
    await app.close();
  });

  it('a user can register with and email and a password', async () => {
    const newUser = {
      email: 'new@user.com',
      password: 'password',
    };
    const response = await request(app.getHttpServer())
      .post('/user/users')
      .send(newUser)
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('item');
    expect(response.body.item.email).toBe('new@user.com');
    expect(response.body.item.unverifiedEmail).toBe('new@user.com');
    expect(response.body.item.roles).toEqual([]);

    // @todo: test that the user gets sent a verification email
    // and then can verify the email with the token
  });

  it('a user cannot register with an existing email', async () => {
    const newUser = {
      email: 'new@user.com',
      password: 'password1',
    };
    const response = await request(app.getHttpServer())
      .post('/user/users')
      .send(newUser)
      .set('Accept', 'application/json');

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('statusCode');
    expect(response.body.error).toBe('Conflict');
  });

  it('a user cannot register with an invalid email', async () => {
    const newUser = {
      email: 'newuser.com',
      password: 'password1',
    };
    const response = await request(app.getHttpServer())
      .post('/user/users')
      .send(newUser)
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('statusCode');
  });

  it('a user cannot register with an invalid password', async () => {
    const newUser = {
      email: 'new2@user.com',
      password: 'a',
    };
    const response = await request(app.getHttpServer())
      .post('/user/users')
      .send(newUser)
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('statusCode');
  });
});
