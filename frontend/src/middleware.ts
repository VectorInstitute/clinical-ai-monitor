import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/configure") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path === "/home" && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Redirect authenticated users away from login page
    if (path === "/login" && token) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/configure/:path*", "/home", "/login"],
};
