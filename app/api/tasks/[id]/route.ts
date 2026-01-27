import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
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
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  // Transform to match TaskWithRelations format
  const taskWithRelations = {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    creatorId: task.userId,
    assignedToId: null,
    order: 0,
    creator: {
      id: task.user.id,
      email: task.user.email,
      name: task.user.name,
    },
    assignedTo: null,
    comments: [],
  }

  return NextResponse.json(taskWithRelations)
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

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    // Transform to match TaskWithRelations format
    const taskWithRelations = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
      creatorId: updatedTask.userId,
      assignedToId: null,
      order: 0,
      creator: {
        id: updatedTask.user.id,
        email: updatedTask.user.email,
        name: updatedTask.user.name,
      },
      assignedTo: null,
      comments: [],
    }

    return NextResponse.json(taskWithRelations)
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
