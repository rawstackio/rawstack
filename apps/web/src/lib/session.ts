import { type SessionOptions } from 'iron-session';

export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  userEmail?: string;
}

// In production SESSION_SECRET must be set to a string of at least 32 characters.
// Generate one with: openssl rand -base64 32
// The fallback below is intentionally weak and only used in non-production environments
// (local dev, test runners) where the session cookie does not need to be production-grade.
const secret =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32
    ? process.env.SESSION_SECRET
    : process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('SESSION_SECRET must be at least 32 characters in production'); })()
      : 'dev-only-insecure-secret-do-not-use!!';

export const sessionOptions: SessionOptions = {
  password: secret,
  cookieName: 'rs_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days — matches REFRESH_TOKEN_TTL
    path: '/',
  },
};
