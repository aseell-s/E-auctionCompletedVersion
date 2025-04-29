import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Check if token is valid - if it has an error property, it's invalid
    const isValidToken = token && !token.error;

    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register") ||
      req.nextUrl.pathname.startsWith("/sellerRegister");

    // If trying to access auth pages with a valid token, redirect to dashboard
    if (isAuthPage && isValidToken) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If trying to access protected pages without a valid token, redirect home
    if (!isValidToken && !isAuthPage) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(new URL(`/login`, req.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Always proceed to the middleware function
        return true;
      },
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
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|$).*)",
  ],
};
