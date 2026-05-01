import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/account'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  // The iron-session cookie ('rs_session') is HttpOnly and encrypted — its presence
  // indicates an active server-side session. The actual session validity is enforced
  // by the BFF routes and the API proxy; this check is purely for routing.
  const hasSession = request.cookies.has('rs_session');
  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
