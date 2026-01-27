import { NextRequest, NextResponse } from "next/server"
import { getSessionWithPermissions } from "./auth"
import { Permission } from "./permissions"

export async function checkPermission(
  req: NextRequest,
  permission: Permission
): Promise<{ authorized: boolean; user?: any; error?: NextResponse }> {
  const session = await getSessionWithPermissions(req.headers)

  if (!session?.user?.id) {
    return {
      authorized: false,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

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

  return { authorized: true, user: session.user }
}
