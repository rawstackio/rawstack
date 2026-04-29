import { cookies } from 'next/headers';
import { getIronSession, type IronSession } from 'iron-session';
import { type SessionData, sessionOptions } from '../session';
import { Api, type refreshData } from './api';

export interface SessionApiContext {
  api: Api;
  session: IronSession<SessionData>;
}

export interface CreateSessionApiOptions {
  /**
   * When true, refreshed tokens are written back to the session cookie.
   * Defaults to FALSE — must be explicitly enabled in Route Handlers and
   * Server Actions. Never pass true from a Server Component (Next.js forbids
   * cookie writes there).
   */
  writeSession?: boolean;
}

/**
 * Creates a per-request Api instance initialised from the iron-session cookie.
 *
 * Pass `{ writeSession: true }` only from Route Handlers or Server Actions.
 * The default is false so Server Components are safe without any extra thought.
 *
 * Returns null when no valid session exists (user is not authenticated).
 */
export async function createSessionApi(options: CreateSessionApiOptions = {}): Promise<SessionApiContext | null> {
  const { writeSession = false } = options;

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.accessToken || !session.refreshToken || !session.userEmail) {
    return null;
  }

  const api = new Api();

  const refresh: refreshData = {
    token: session.refreshToken,
    expiresAt: session.expiresAt ? new Date(session.expiresAt).getTime() : 0,
    email: session.userEmail,
  };

  // Initialise tokens without passing the callback so init() does not fire
  // onRefreshDataUpdated immediately (which would cause a needless session.save()).
  // The callback is wired up afterwards and will only fire on an actual refresh.
  api.init(session.accessToken, refresh);

  if (writeSession) {
    api.onRefreshDataUpdated = async (accessToken, data) => {
      if (accessToken && data) {
        session.accessToken = accessToken;
        session.refreshToken = data.token;
        session.expiresAt = new Date(data.expiresAt).toISOString();
        await session.save();
      } else {
        await session.destroy();
      }
    };
  }

  return { api, session };
}
