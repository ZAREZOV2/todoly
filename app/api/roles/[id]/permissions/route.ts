import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const updatePermissionsSchema = z.object({
  permissionIds: z.array(z.string()),
})

// PUT /api/roles/[id]/permissions - Assign permissions to role
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "roles.manage")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  try {
    const body = await req.json()
    const { permissionIds } = updatePermissionsSchema.parse(body)

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id },
    })

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Verify all permissions exist
    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    })

    if (permissions.length !== permissionIds.length) {
      return NextResponse.json(
        { error: "One or more permissions not found" },
        { status: 400 }
      )
    }

    // Delete existing permissions and assign new ones
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    })

    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId: id,
        permissionId,
      })),
    })

    const updatedRole = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: {
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

    return NextResponse.json(updatedRole)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Permission assignment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
