import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  const session = req.auth
  const path = req.nextUrl.pathname

  // Protect all routes except auth pages and public assets
  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // Require authentication for all other routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Admin routes require users.manage or roles.manage permission
  if (path.startsWith("/admin")) {
    const permissions = (session.user?.permissions as string[]) || []
    if (
      !permissions.includes("users.manage") &&
      !permissions.includes("roles.manage")
    ) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
