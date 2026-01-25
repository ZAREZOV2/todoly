import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  assignedToId: z.string().optional(),
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
  const assignedTo = searchParams.get("assignedTo")
  const search = searchParams.get("search")

  const where: any = {}

  if (status) {
    where.status = status
  }
  if (priority) {
    where.priority = priority
  }
  if (assignedTo) {
    where.assignedToId = assignedTo
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const tasks = await prisma.task.findMany({
    where,
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
          createdAt: "desc",
        },
      },
    },
    orderBy: [
      { order: "asc" },
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
    const { title, description, priority, assignedToId } = taskSchema.parse(body)

    // Check assign permission if assigning to someone
    if (assignedToId && assignedToId !== user.id) {
      const assignCheck = await checkPermission(req, "tasks.assign")
      if (!assignCheck.authorized) {
        return assignCheck.error!
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || "MEDIUM",
        creatorId: user.id,
        assignedToId: assignedToId || null,
      },
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
        comments: true,
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
