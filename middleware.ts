import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Allow public assets and auth routes
  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // Lightweight auth check: presence of NextAuth session cookie
  const hasSessionCookie =
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token")

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply middleware only to page routes, not API routes.
    // Exclude:
    // - all /api/* (API routes, including NextAuth and debug endpoints)
    // - _next/static, _next/image (Next.js internals)
    // - favicon and static assets
    // - common static file extensions
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
