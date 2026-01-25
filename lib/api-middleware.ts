import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"
import { prisma } from "./db"
import { Permission, hasPermission } from "./permissions"

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

  // Get user with roles and permissions
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

  if (!hasPermission(user as any, permission)) {
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
