import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
