import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"

// GET /api/users - Get all users
export async function GET(req: NextRequest) {
  const permissionCheck = await checkPermission(req, "users.manage")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      userRoles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(users)
}
