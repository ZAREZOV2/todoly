import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
})

// GET /api/tasks - Get all tasks
export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const search = searchParams.get("search")

  const where: any = {}

  if (status) {
    where.status = status
  }
  if (priority) {
    where.priority = priority
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { createdAt: "desc" },
    ],
  })

  return NextResponse.json(tasks)
}

// POST /api/tasks - Create new task
export async function POST(req: NextRequest) {
  const permissionCheck = await checkPermission(req, "tasks.create")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  const user = permissionCheck.user!

  try {
    const body = await req.json()
    const { title, description, status, priority } = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        userId: user.id,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Task creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
