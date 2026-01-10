import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GlobalHttpExceptionFilter } from '~/common/infrastructure/exception/global-http.exception-filter';
import { AppModule } from '~/app.module';
import UserProvider from '../../fixtures/user.provider';
import TokenProvider from '../../fixtures/token.provider';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { UserModel } from '~/user/domain/model/user/user.model';

describe('Admin creating users', () => {
  let app: INestApplication;
  const adminEmail = 'admin-creator@rawstack.io';
  const regularUserEmail = 'regular-user@rawstack.io';
  const newUserEmail = 'new-user-no-password@rawstack.io';
  const newUserWithPasswordEmail = 'new-user-with-password@rawstack.io';

  let adminUser: UserModel;
  let regularUser: UserModel;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();

    // Create admin user and regular user for testing
    adminUser = await UserProvider.createUser(app, adminEmail, UserProvider.defaultPassword, [UserRoles.Admin]);
    regularUser = await UserProvider.createUser(app, regularUserEmail, UserProvider.defaultPassword, [
      UserRoles.VerifiedUser,
    ]);
  });

  afterAll(async () => {
    await UserProvider.deleteUsers(app, [adminEmail, regularUserEmail, newUserEmail, newUserWithPasswordEmail]);
    await app.close();
  });

  it('an admin can create a user without providing a password', async () => {
    const tokens = await TokenProvider.getAccessTokenTokens(app, adminUser);

    const response = await request(app.getHttpServer())
      .post('/user/users')
      .send({
        email: newUserEmail,
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('item');
    expect(response.body.item.email).toBe(newUserEmail);
    expect(response.body.item.unverifiedEmail).toBe(newUserEmail);
    expect(response.body.item.roles).toEqual([]);
  });

  it('a regular user cannot create a user without providing a password', async () => {
    const tokens = await TokenProvider.getAccessTokenTokens(app, regularUser);

    const response = await request(app.getHttpServer())
      .post('/user/users')
      .send({
        email: 'another-user@rawstack.io',
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Forbidden');
  });

  it('an unauthenticated user cannot create a user without providing a password', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/users')
      .send({
        email: 'unauthenticated-user@rawstack.io',
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });

  it('anyone can create a user when providing a password (registration)', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/users')
      .send({
        email: newUserWithPasswordEmail,
        password: 'ValidPassword123!',
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('item');
    expect(response.body.item.email).toBe(newUserWithPasswordEmail);
    expect(response.body.item.unverifiedEmail).toBe(newUserWithPasswordEmail);
    expect(response.body.item.roles).toEqual([]);
  });
});
