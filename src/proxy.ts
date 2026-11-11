import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set([
  '/login',
  '/setup',
  '/api/auth/bootstrap',
  '/api/auth/login',
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPath = PUBLIC_PATHS.has(pathname);
  const sessionCookie = request.cookies.get('minierp_session')?.value;

  if (publicPath) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    if (!sessionCookie) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    return NextResponse.next();
  }

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
