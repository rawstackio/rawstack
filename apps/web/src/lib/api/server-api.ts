import { createSessionApi } from './session-api';
import { type UserDTO } from '../model/user-model';

export async function getServerUser(): Promise<UserDTO | null> {
  const ctx = await createSessionApi({ writeSession: false });
  if (!ctx) return null;

  try {
    const { data } = await ctx.api.user.getCurrentUser();
    const item = data.item;
    return {
      id: item.id,
      email: item.email,
      roles: item.roles ?? [],
      unverifiedEmail: item.unverifiedEmail ?? undefined,
    };
  } catch {
    return null;
  }
}
