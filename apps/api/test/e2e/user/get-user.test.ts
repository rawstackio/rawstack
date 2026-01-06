import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GlobalHttpExceptionFilter } from '~/common/infrastructure/exception/global-http.exception-filter';
import { AppModule } from '~/app.module';
import UserProvider from '../../fixtures/user.provider';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { UserModel } from '~/user/domain/model/user/user.model';
import TokenProvider from '../../fixtures/token.provider';

describe('get user', () => {
  let app: INestApplication;
  let admin: UserModel;
  let user: UserModel;
  const userEmail = 'get-user@rawstack.io';
  const adminUserEmail = 'admin-get-user@rawstack.io';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalHttpExceptionFilter());

    await app.init();

    [admin, user] = await Promise.all([
      UserProvider.createUser(app, adminUserEmail, UserProvider.defaultPassword, [UserRoles.Admin]),
      UserProvider.createUser(app, userEmail),
    ]);
  });

  afterAll(async () => {
    await UserProvider.deleteUsers(app, [userEmail, adminUserEmail]);
    await app.close();
  });

  test('an admin user can get user', async () => {
    const tokens = await TokenProvider.getAccessTokenTokens(app, admin);
    const accessToken = tokens.accessToken;

    const getUserResponse = await request(app.getHttpServer())
      .get('/user/users/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.body).toHaveProperty('item');
    expect(getUserResponse.body.item.id).toBe(user.id.toString());
    expect(getUserResponse.body.item.email).toBe(userEmail);
  });

  test('a non admin user cannot get another user', async () => {
    const tokens = await TokenProvider.getAccessTokenTokens(app, user);
    const accessToken = tokens.accessToken;

    const getUserResponse = await request(app.getHttpServer())
      .get('/user/users/' + admin.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(getUserResponse.status).toBe(403);
  });
});
