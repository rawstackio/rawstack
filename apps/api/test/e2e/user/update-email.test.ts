import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GlobalHttpExceptionFilter } from '~/common/infrastructure/exception/global-http.exception-filter';
import { AppModule } from '~/app.module';
import UserProvider from '../../fixtures/user.provider';
import { InMemoryAdaptor } from '~/common/infrastructure/event/adaptor/in-memory.adaptor';
import TokenProvider from '../../fixtures/token.provider';
import { UserModel } from '~/user/domain/model/user/user.model';

describe('email updating', () => {
  let app: INestApplication;
  const user1Email = 'update-email-1@rawstack.io';
  const user2Email = 'update-email-2@rawstack.io';
  const user3Email = 'update-email-3@rawstack.io';
  const updatedUser1Email = 'updated-email-1@rawstack.io';
  const updatedUser2Email = 'updated-email-2@rawstack.io';
  const updatedUser3Email = 'updated-email-2@rawstack.io';
  const existingUserEmail = 'update-existing-email@rawstack.io';

  let eventAdaptor: InMemoryAdaptor;
  let user1: UserModel;
  let user2: UserModel;
  let user3: UserModel;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalHttpExceptionFilter());

    await app.init();
    eventAdaptor = app.get(InMemoryAdaptor);

    user1 = await UserProvider.createUser(app, user1Email);
    await UserProvider.createUser(app, existingUserEmail);
    user2 = await UserProvider.createUser(app, user2Email);
    user3 = await UserProvider.createUser(app, user3Email);

    // add a delay to allow for async saga processing
    await new Promise((resolve) => setTimeout(resolve, 500));
    eventAdaptor.clear();
  });

  afterAll(async () => {
    await UserProvider.deleteUsers(app, [
      user1Email,
      user2Email,
      user3Email,
      updatedUser1Email,
      updatedUser2Email,
      existingUserEmail,
    ]);
    await app.close();
  });

  test('a user can update their email', async () => {
    const tokens = await TokenProvider.getAccessTokenTokens(app, user1);
    const accessToken = tokens.accessToken;

    const updateUserResponse = await request(app.getHttpServer())
      .patch('/user/users/' + user1.id)
      .send({
        email: updatedUser1Email,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    // add a delay to allow for async saga processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(updateUserResponse.status).toBe(200);
    expect(updateUserResponse.body).toHaveProperty('item');

    expect(updateUserResponse.body.item.id).toBe(user1.id);
    expect(updateUserResponse.body.item.email).toBe(user1Email);
    expect(updateUserResponse.body.item.unverifiedEmail).toBe(updatedUser1Email);
    expect(updateUserResponse.body.item.roles).toEqual([]);

    const events = eventAdaptor.getEvents();

    const firstEvent = events.filter((event) => {
      return (
        event.DetailType === 'user.user.unverifiedEmailWasSet' && JSON.parse(event.Detail).aggregateId === user1.id
      );
    })[0];

    expect(firstEvent.Source).toBe('api');
    expect(firstEvent.DetailType).toBe('user.user.unverifiedEmailWasSet');

    const firstEventDetail = JSON.parse(firstEvent.Detail);
    expect(firstEventDetail.aggregateId).toBe(user1.id);
    expect(firstEventDetail.entity.email).toBe(user1Email);
    expect(firstEventDetail.entity.unverifiedEmail).toBe(updatedUser1Email);
    expect(firstEventDetail.data.unverifiedEmail).toBe(updatedUser1Email);

    const secondEvent = events.filter((event) => {
      const detail = JSON.parse(event.Detail);
      return (
        event.DetailType === 'auth.token.wasCreated' &&
        detail.data.userId === user1.id &&
        detail.data.type === 'EMAIL_VERIFICATION'
      );
    })[0];

    expect(secondEvent.Source).toBe('api');
    expect(secondEvent.DetailType).toBe('auth.token.wasCreated');

    const secondEventDetail = JSON.parse(secondEvent.Detail);
    expect(secondEventDetail.data.userId).toBe(user1.id);
    expect(secondEventDetail.data.type).toBe('EMAIL_VERIFICATION');
    expect(secondEventDetail.data.email).toBe(updatedUser1Email);
    expect(secondEventDetail.data.token).toBeDefined();

    // Verify the token payload contains the expected fields
    const secondEventToken = secondEventDetail.data.token;
    expect(secondEventToken).toBeDefined();

    // Decode the JWT payload (2nd part of token)
    const tokenParts = secondEventToken.split('.');
    expect(tokenParts.length).toBe(3);

    const decodedPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    expect(decodedPayload.type).toBe('EMAIL_VERIFICATION');
    expect(decodedPayload.id).toBeDefined();
    expect(decodedPayload.userId).toBe(user1.id);
    expect(decodedPayload.email).toBe(updatedUser1Email);

    // test that the verification token can be used to verify the email
    const verifyEmailResponse = await request(app.getHttpServer())
      .post('/auth/action-requests')
      .send({
        token: secondEventToken,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(verifyEmailResponse.status).toBe(202);
    expect(verifyEmailResponse.body.item.status).toBe('PROCESSING');
    expect(verifyEmailResponse.body.item.action).toBe('EMAIL_VERIFICATION');

    // add a delay to allow for async saga processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // get the current user details to verify the email was updated
    const getUserResponse = await request(app.getHttpServer())
      .get('/user/users/current')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.body).toHaveProperty('item');
    expect(getUserResponse.body.item.email).toBe(updatedUser1Email);
    expect(getUserResponse.body.item.unverifiedEmail).toBeUndefined();
    expect(getUserResponse.body.item.roles.includes('VERIFIED_USER')).toBe(true);

    // @todo: check the token action has been marked as completed
  });

  test('a user cannot update to an existing email', async () => {
    const tokens = await TokenProvider.getAccessTokenTokens(app, user2);
    const accessToken = tokens.accessToken;

    const updateUserResponse = await request(app.getHttpServer())
      .patch('/user/users/' + user2.id)
      .send({
        email: existingUserEmail,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(updateUserResponse.status).toBe(409);
  });

  test('a user can only update to the unverified email in the token and stored it against the user', async () => {
    // const user = await UserProvider.createUser(app, user3Email);
    const tokens = await TokenProvider.getAccessTokenTokens(app, user3);
    const accessToken = tokens.accessToken;

    const updateUserResponse = await request(app.getHttpServer())
      .patch('/user/users/' + user3.id)
      .send({
        email: updatedUser3Email,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(updateUserResponse.status).toBe(200);

    // add a delay to allow for async saga processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    const events = eventAdaptor.getEvents();
    // expect(events.length).toBe(2);

    // const secondEvent = events[1];
    const secondEvent = events.filter((event) => {
      const detail = JSON.parse(event.Detail);
      return (
        event.DetailType === 'auth.token.wasCreated' &&
        detail.data.userId === user3.id &&
        detail.data.type === 'EMAIL_VERIFICATION'
      );
    })[0];
    const secondEventDetail = JSON.parse(secondEvent.Detail);

    // Verify the token payload contains the expected fields
    const firstEmailVerificationToken = secondEventDetail.data.token;

    await request(app.getHttpServer())
      .patch('/user/users/' + user3.id)
      .send({
        email: 'some-email@rawstack.io',
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    // test that the verification token can be used to verify the email
    const verifyEmailResponse = await request(app.getHttpServer())
      .post('/auth/action-requests')
      .send({
        token: firstEmailVerificationToken,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(verifyEmailResponse.status).toBe(202);

    // @todo: this has been accepted for processing, but the email should not be updated as the user has changed it since the token was issued

    // add a delay to allow for async saga processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // get the current user details to verify the email was updated
    const getUserResponse = await request(app.getHttpServer())
      .get('/user/users/current')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.body).toHaveProperty('item');
    expect(getUserResponse.body.item.email).toBe(user3Email);
    // expect(getUserResponse.body.item.unverifiedEmail).toBe

    // @todo: check the token action has been marked as failed
  });
});
