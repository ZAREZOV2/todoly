import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"
import { prisma } from "./db"
import { Permission } from "./permissions"

export async function checkPermission(
  req: NextRequest,
  permission: Permission
): Promise<{ authorized: boolean; user?: any; error?: NextResponse }> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      authorized: false,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  // Check permissions from session (already loaded in auth callback)
  const permissions = (session.user?.permissions as string[]) || []

  if (!permissions.includes(permission)) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      ),
    }
  }

  // Permission found in session
  return { authorized: true, user: session.user }
}
