import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  if (token && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    !token &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/profile"))
  ) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  } else if (pathname === "/catalogue") {
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/login",
    "/auth/signup",
    "/dashboard/:path*",
    "/profile/:path*",
  ],
};
