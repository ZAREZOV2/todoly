import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(req: NextRequest) {
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

  // Check authentication using NextAuth auth() helper (JWT-based session)
  const session = await auth()

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Admin routes - basic permission check
  // Detailed checks are done in the page components
  if (path.startsWith("/admin")) {
    const permissions = session.user?.permissions || []
    if (
      !permissions.includes("users.manage") &&
      !permissions.includes("roles.manage")
    ) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    // Apply middleware only to page routes, not API routes.
    // Exclude:
    // - all /api/* (API routes, including NextAuth and debug endpoints)
    // - _next/static, _next/image (Next.js internals)
    // - favicon and static assets
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
