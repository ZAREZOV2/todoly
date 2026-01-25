import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1),
})

// GET /api/tasks/[id]/comments - Get comments for a task
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const comments = await prisma.comment.findMany({
    where: { taskId: id },
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
  })

  return NextResponse.json(comments)
}

// POST /api/tasks/[id]/comments - Create comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "comments.create")
  if (!permissionCheck.authorized) {
    return permissionCheck.error!
  }

  const user = permissionCheck.user!

  // Verify task exists
  const task = await prisma.task.findUnique({
    where: { id },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { content } = commentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: id,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Comment creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
