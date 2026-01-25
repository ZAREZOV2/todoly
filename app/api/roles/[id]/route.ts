import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

// GET /api/roles/[id] - Get role by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "roles.manage")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  const role = await prisma.role.findUnique({
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

  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 })
  }

  return NextResponse.json(role)
}

// PUT /api/roles/[id] - Update role
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
    const updateData = updateRoleSchema.parse(body)

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    return NextResponse.json(role)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Role update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/roles/[id] - Delete role
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "roles.manage")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  await prisma.role.delete({
    where: { id },
  })

  return NextResponse.json({ message: "Role deleted successfully" })
}
