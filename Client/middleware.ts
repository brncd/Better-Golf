import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

const protectedRoutes = [
  '/dashboard',
  '/tournaments',
  '/players',
  '/courses',
  '/admin',
  '/scoring',
  '/profile'
];

const adminRoutes = [
  '/admin'
];

async function verifyToken(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not set");
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url);
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url);
    }

    const payload = await verifyToken(token, secret);

    if (!payload) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url);
    }

    const roles = (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || []) as string[];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute && !roles.includes('Admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|.*\.png$).*)',
  ],
}