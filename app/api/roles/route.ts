import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

// GET /api/roles - Get all roles
export async function GET(req: NextRequest) {
  const permissionCheck = await checkPermission(req, "roles.manage")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  const roles = await prisma.role.findMany({
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
    orderBy: {
      name: "asc",
    },
  })

  return NextResponse.json(roles)
}

// POST /api/roles - Create new role
export async function POST(req: NextRequest) {
  const permissionCheck = await checkPermission(req, "roles.manage")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  try {
    const body = await req.json()
    const { name, description } = createRoleSchema.parse(body)

    const role = await prisma.role.create({
      data: {
        name,
        description: description || null,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Role with this name already exists" },
        { status: 400 }
      )
    }
    console.error("Role creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
