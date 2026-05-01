'use server';

import { type UpdateUserRequest, type User } from '@rawstack/api-client';
import { createSessionApi } from '@/lib/api/session-api';
import { ApiError } from '@/lib/api/exception/errors';

export type UpdateUserResult =
  | { ok: true; user: User }
  | { ok: false; error: { statusCode: number; type: string; message: string } };

export async function updateUser(userId: string, params: UpdateUserRequest): Promise<UpdateUserResult> {
  const ctx = await createSessionApi({ writeSession: true });
  if (!ctx) return { ok: false, error: { statusCode: 401, type: 'UNAUTHORIZED', message: 'Not authenticated' } };

  try {
    const { data } = await ctx.api.user.updateUser(userId, params);
    return { ok: true, user: data.item };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: { statusCode: err.statusCode, type: err.type, message: err.message } };
    }
    return { ok: false, error: { statusCode: 500, type: 'UNKNOWN_ERROR', message: 'Something went wrong' } };
  }
}

export type DeleteUserResult =
  | { ok: true }
  | { ok: false; error: { statusCode: number; type: string; message: string } };

export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  const ctx = await createSessionApi({ writeSession: true });
  if (!ctx) return { ok: false, error: { statusCode: 401, type: 'UNAUTHORIZED', message: 'Not authenticated' } };

  try {
    await ctx.api.user.deleteUser(userId);
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: { statusCode: err.statusCode, type: err.type, message: err.message } };
    }
    return { ok: false, error: { statusCode: 500, type: 'UNKNOWN_ERROR', message: 'Something went wrong' } };
  }
}

