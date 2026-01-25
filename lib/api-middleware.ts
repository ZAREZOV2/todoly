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
    // If permission not in session, fetch from DB (fallback)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return {
        authorized: false,
        error: NextResponse.json({ error: "User not found" }, { status: 404 }),
      }
    }

    const userPermissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    )

    if (!userPermissions.includes(permission)) {
      return {
        authorized: false,
        error: NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        ),
      }
    }

    return { authorized: true, user }
  }

  // Permission found in session, no need to query DB
  return { authorized: true }
}
