import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  assignedToId: z.string().nullable().optional(),
})

// GET /api/tasks/[id] - Get task by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "tasks.read")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json(task)
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "tasks.update")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  const user = permissionCheck.user!

  try {
    const task = await prisma.task.findUnique({
      where: { id },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const body = await req.json()
    const updateData = updateTaskSchema.parse(body)

    // Check assign permission if assigning to someone
    if (updateData.assignedToId && updateData.assignedToId !== user.id) {
      const assignCheck = await checkPermission(req, "tasks.assign")
      if (!assignCheck.authorized) {
        return assignCheck.error!
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Task update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "tasks.delete")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  const task = await prisma.task.findUnique({
    where: { id },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  await prisma.task.delete({
    where: { id },
  })

  return NextResponse.json({ message: "Task deleted successfully" })
}
