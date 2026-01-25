import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const updateRolesSchema = z.object({
  roleIds: z.array(z.string()),
})

// PUT /api/users/[id]/roles - Assign roles to user
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "users.manage")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  try {
    const body = await req.json()
    const { roleIds } = updateRolesSchema.parse(body)

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify all roles exist
    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
    })

    if (roles.length !== roleIds.length) {
      return NextResponse.json(
        { error: "One or more roles not found" },
        { status: 400 }
      )
    }

    // Delete existing roles and assign new ones
    await prisma.userRole.deleteMany({
      where: { userId: id },
    })

    await prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({
        userId: id,
        roleId,
      })),
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
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
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Role assignment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
