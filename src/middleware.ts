import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define role-based access control
const ROLE_PERMISSIONS = {
  owner: ['*'], // Full access
  admin: ['*'], // Full access
  pm: [
    '/dashboard',
    '/projects',
    '/crm',
    '/reports',
    '/timesheets',
    '/settings',
    '/optimize'
  ],
  sales: [
    '/dashboard',
    '/projects',
    '/crm',
    '/reports',
    '/timesheets',
    '/optimize'
  ],
  member: [
    '/dashboard',
    '/projects',
    '/crm',
    '/reports',
    '/timesheets',
    '/optimize'
  ]
};

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/projects',
  '/crm',
  '/reports',
  '/timesheets',
  '/settings',
  '/optimize'
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register' || path === '/';

  // Get authentication token and user role from cookies
  const token = request.cookies.get('auth-token')?.value || '';
  const userRole = (request.cookies.get('user-role')?.value || 'member').toLowerCase();
  
  // Debug logging (remove in production)
  console.log('Middleware:', { path, token: !!token, userRole, isPublicPath });

  // Check if the current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.nextUrl);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isPublicPath && token && path !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  // Role-based access control for authenticated users
  if (token && isProtectedRoute) {
    const userPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
    
    // Owner and Admin have access to everything
    if (userRole === 'owner' || userRole === 'admin' || userPermissions.includes('*')) {
      return NextResponse.next();
    }

    // Check if user has permission for this route
    const hasPermission = userPermissions.some(permission => 
      path.startsWith(permission)
    );

    if (!hasPermission) {
      // Log for debugging
      console.log('Access denied:', { userRole, path, userPermissions, hasPermission });
      
      // Redirect to dashboard with error message
      const dashboardUrl = new URL('/dashboard', request.nextUrl);
      dashboardUrl.searchParams.set('error', 'access-denied');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
