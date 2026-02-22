import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assignedToId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  order: z.number().optional(),
})

const taskInclude = {
  user: { select: { id: true, email: true, name: true } },
  assignedTo: { select: { id: true, email: true, name: true } },
  comments: {
    include: {
      author: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
}

function toTaskWithRelations(task: any) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    order: task.order,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    creatorId: task.userId,
    assignedToId: task.assignedToId ?? null,
    creator: { id: task.user.id, email: task.user.email, name: task.user.name },
    assignedTo: task.assignedTo ?? null,
    comments: task.comments ?? [],
  }
}

// GET /api/tasks/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "tasks.read")
  if (!permissionCheck.authorized) return permissionCheck.error!

  const task = await prisma.task.findUnique({ where: { id }, include: taskInclude })
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json(toTaskWithRelations(task))
}

// PUT /api/tasks/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "tasks.update")
  if (!permissionCheck.authorized) return permissionCheck.error!

  try {
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateTaskSchema.parse(body)

    const updateData: any = {}
    if (parsed.title !== undefined) updateData.title = parsed.title
    if (parsed.description !== undefined) updateData.description = parsed.description
    if (parsed.status !== undefined) updateData.status = parsed.status
    if (parsed.priority !== undefined) updateData.priority = parsed.priority
    if (parsed.order !== undefined) updateData.order = parsed.order
    if ("assignedToId" in parsed) updateData.assignedToId = parsed.assignedToId ?? null
    if ("dueDate" in parsed) {
      updateData.dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: taskInclude,
    })

    return NextResponse.json(toTaskWithRelations(updatedTask))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Task update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "tasks.delete")
  if (!permissionCheck.authorized) return permissionCheck.error!

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ message: "Task deleted successfully" })
}
