import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
export default withAuth(
  function middleware(req) {
    // If the user is already logged in, redirect him to dashboard
    // if he tries to access the login or register page
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/register') ||
      req.nextUrl.pathname.startsWith('/sellerRegister');

    if (isAuthPage) {
      console.log('isAuthPage: ', isAuthPage);
      console.log('isAuth: ', isAuth);
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return null; // If not logged in, allow access to login and register pages
    }

    // If the user is not logged in, redirect him to login page
    // with the original URL as a parameter so that we can redirect
    // him back to the original page after login
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      // return NextResponse.redirect(
      //   new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      // );
      return NextResponse.redirect(new URL(`/`, req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // always allow access if there is a token
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login
     * - register
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|$).*)',
  ],
};
