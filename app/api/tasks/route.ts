import { NextRequest, NextResponse } from "next/server"
import { getSessionWithPermissions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assignedToId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
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

// GET /api/tasks
export async function GET(req: NextRequest) {
  const session = await getSessionWithPermissions(req.headers)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const search = searchParams.get("search")
  const assignedTo = searchParams.get("assignedTo")

  const where: any = {}
  if (status) where.status = status
  if (priority) where.priority = priority
  if (assignedTo) where.assignedToId = assignedTo
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(tasks.map(toTaskWithRelations))
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  const permissionCheck = await checkPermission(req, "tasks.create")
  if (!permissionCheck.authorized) return permissionCheck.error!
  const user = permissionCheck.user!

  try {
    const body = await req.json()
    const { title, description, status, priority, assignedToId, dueDate } =
      taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        status: status ?? "TODO",
        priority: priority ?? "MEDIUM",
        userId: user.id,
        assignedToId: assignedToId ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: taskInclude,
    })

    return NextResponse.json(toTaskWithRelations(task), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Task creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
