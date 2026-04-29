'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { type User } from '@rawstack/api-client';
import { type SessionData, sessionOptions } from '@/lib/session';
import { Api } from '@/lib/api/api';
import DefaultApi from '@/lib/api/api';
import { createSessionApi } from '@/lib/api/session-api';
import { ApiError } from '@/lib/api/exception/errors';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function saveSession(
  accessToken: string,
  refreshToken: string,
  expiresAt: string,
  userEmail: string,
): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.accessToken = accessToken;
  session.refreshToken = refreshToken;
  session.expiresAt = expiresAt;
  session.userEmail = userEmail;
  await session.save();
}

async function getCurrentUserWithToken(accessToken: string): Promise<User> {
  const api = new Api();
  api.accessToken = accessToken;
  const { data } = await api.user.getCurrentUser();
  return data.item;
}

// ─── Actions ────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<User> {
  const normalizedEmail = email.toLowerCase();
  const { data } = await DefaultApi.auth.createToken({ email: normalizedEmail, password });
  const tokens = data.item as { accessToken: string; refreshToken: string; expiresAt: string };

  await saveSession(tokens.accessToken, tokens.refreshToken, tokens.expiresAt, normalizedEmail);

  return getCurrentUserWithToken(tokens.accessToken);
}

export async function autoLogin(email: string, token: string): Promise<User> {
  const normalizedEmail = email.toLowerCase();
  const { data } = await DefaultApi.auth.createToken({ email: normalizedEmail, refreshToken: token });
  const tokens = data.item as { accessToken: string; refreshToken: string; expiresAt: string };

  await saveSession(tokens.accessToken, tokens.refreshToken, tokens.expiresAt, normalizedEmail);

  return getCurrentUserWithToken(tokens.accessToken);
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  await session.destroy();
}

export async function getMe(): Promise<User | null> {
  const ctx = await createSessionApi({ writeSession: true });
  if (!ctx) return null;
  try {
    const { data } = await ctx.api.user.getCurrentUser();
    return data.item;
  } catch {
    return null;
  }
}

export type RegisterResult =
  | { ok: true; user: User }
  | { ok: false; error: { statusCode: number; type: string; message: string } };

export async function register(email: string, password: string): Promise<RegisterResult> {
  const normalizedEmail = email.toLowerCase();

  try {
    const { data: userData } = await DefaultApi.user.createUser({ email: normalizedEmail, password });
    const { data: tokenData } = await DefaultApi.auth.createToken({ email: normalizedEmail, password });

    const tokens = tokenData.item as { accessToken: string; refreshToken: string; expiresAt: string };

    await saveSession(tokens.accessToken, tokens.refreshToken, tokens.expiresAt, normalizedEmail);

    return { ok: true, user: userData.item };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: { statusCode: err.statusCode, type: err.type, message: err.message } };
    }
    return { ok: false, error: { statusCode: 500, type: 'UNKNOWN_ERROR', message: 'Something went wrong' } };
  }
}
