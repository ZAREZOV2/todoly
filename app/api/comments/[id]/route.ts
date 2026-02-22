import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkPermission } from "@/lib/api-middleware"
import { z } from "zod"

const updateCommentSchema = z.object({
  content: z.string().min(1),
})

// PUT /api/comments/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "comments.update")
  if (!permissionCheck.authorized) return permissionCheck.error!
  const user = permissionCheck.user!

  try {
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Allow edit only for own comment (or if admin/manager via permission)
    const isOwner = comment.authorId === user.id
    const isAdmin = ["ADMIN", "MANAGER"].includes(user.role ?? "")
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { content } = updateCommentSchema.parse(body)

    const updated = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: { select: { id: true, email: true, name: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Comment update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/comments/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const permissionCheck = await checkPermission(req, "comments.delete")
  if (!permissionCheck.authorized) return permissionCheck.error!
  const user = permissionCheck.user!

  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 })
  }

  const isOwner = comment.authorId === user.id
  const isAdmin = ["ADMIN", "MANAGER"].includes(user.role ?? "")
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.comment.delete({ where: { id } })
  return NextResponse.json({ message: "Comment deleted successfully" })
}
