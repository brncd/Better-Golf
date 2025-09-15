import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/tournaments',
  '/players',
  '/courses',
  '/admin',
  '/scoring'
]

// Define admin-only routes
const adminRoutes = [
  '/admin'
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/'
]

// Helper function to validate JWT token
function isValidToken(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  } catch {
    return false
  }
}

// Helper function to get roles from JWT token
function getRolesFromToken(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                 payload.role || []
    return Array.isArray(roles) ? roles : [roles]
  } catch {
    return []
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from localStorage (we'll handle this client-side)
  // For now, we'll do basic route protection without token validation
  // since localStorage is not accessible in middleware

  // Check if the route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    // Since we can't access localStorage in middleware, we'll let client-side
    // components handle authentication redirects. This middleware will mainly
    // handle static route protection.
    
    // In a production app, you might want to use cookies for server-side validation
    // or implement a different authentication strategy
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
