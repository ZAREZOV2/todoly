import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const updateCommentSchema = z.object({
  content: z.string().min(1),
})

// PUT /api/comments/[id] - Update comment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
  })

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 })
  }

  // Check if user is the author or has update permission
  const isAuthor = comment.authorId === session?.user?.id
  const hasUpdatePermission = await checkPermission(req, "comments.update")

  if (!isAuthor && !hasUpdatePermission.authorized) {
    return NextResponse.json(
      { error: "You can only edit your own comments" },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const { content } = updateCommentSchema.parse(body)

  const updatedComment = await prisma.comment.update({
    where: { id },
      data: { content },
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

    return NextResponse.json(updatedComment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Comment update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
  })

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 })
  }

  // Check if user is the author or has delete permission
  const isAuthor = comment.authorId === session.user.id
  const hasDeletePermission = await checkPermission(req, "comments.delete")

  if (!isAuthor && !hasDeletePermission.authorized) {
    return NextResponse.json(
      { error: "You can only delete your own comments" },
      { status: 403 }
    )
  }

  await prisma.comment.delete({
    where: { id },
  })

  return NextResponse.json({ message: "Comment deleted successfully" })
}
