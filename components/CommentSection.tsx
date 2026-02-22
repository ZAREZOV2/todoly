"use client"

import { useState } from "react"
import { useSessionWithPermissions } from "@/lib/use-session"
import type { TaskWithRelations } from "@/lib/types"
import {
  Button,
  Text,
  TextArea,
  Divider,
  Card,
} from "@gravity-ui/uikit"

interface CommentSectionProps {
  taskId: string
  comments: TaskWithRelations["comments"]
}

export function CommentSection({ taskId, comments: initialComments }: CommentSectionProps) {
  const { data: session } = useSessionWithPermissions()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const canCreate = session?.user?.permissions?.includes("comments.create")
  const canUpdate = session?.user?.permissions?.includes("comments.update")
  const canDelete = session?.user?.permissions?.includes("comments.delete")

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !canCreate) return

    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })
      if (response.ok) {
        const comment = await response.json()
        setComments([...comments, comment])
        setNewComment("")
      }
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateComment = async (id: string) => {
    if (!editContent.trim()) return
    setLoading(true)
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      })
      if (response.ok) {
        const updated = await response.json()
        setComments(comments.map((c) => (c.id === id ? updated : c)))
        setEditingId(null)
        setEditContent("")
      }
    } catch (error) {
      console.error("Failed to update comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return
    setLoading(true)
    try {
      const response = await fetch(`/api/comments/${id}`, { method: "DELETE" })
      if (response.ok) {
        setComments(comments.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const isOwnComment = (comment: (typeof comments)[0]) => {
    return comment.author.id === session?.user?.id
  }

  return (
    <div style={{ marginTop: 8 }}>
      <Divider style={{ marginBottom: 16 }} />
      <Text variant="subheader-2" style={{ marginBottom: 12, display: "block" }}>
        Comments ({comments.length})
      </Text>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {comments.map((comment) => (
          <Card key={comment.id} view="filled" style={{ padding: 12 }}>
            {editingId === comment.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <TextArea
                  value={editContent}
                  onUpdate={setEditContent}
                  rows={3}
                  placeholder="Edit comment..."
                  size="m"
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    view="action"
                    size="s"
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={loading}
                    loading={loading}
                  >
                    Save
                  </Button>
                  <Button
                    view="outlined"
                    size="s"
                    onClick={() => {
                      setEditingId(null)
                      setEditContent("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Text variant="body-2" style={{ fontWeight: 500 }}>
                      {comment.author.name || comment.author.email}
                    </Text>
                    <Text variant="caption-2" color="hint">
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                  </div>
                  {(isOwnComment(comment) || canUpdate || canDelete) && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {(isOwnComment(comment) || canUpdate) && (
                        <Button
                          view="flat"
                          size="xs"
                          onClick={() => {
                            setEditingId(comment.id)
                            setEditContent(comment.content)
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      {(isOwnComment(comment) || canDelete) && (
                        <Button
                          view="flat-danger"
                          size="xs"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <Text variant="body-2" style={{ whiteSpace: "pre-wrap" }}>
                  {comment.content}
                </Text>
              </div>
            )}
          </Card>
        ))}
      </div>

      {canCreate && (
        <form onSubmit={handleAddComment}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <TextArea
              value={newComment}
              onUpdate={setNewComment}
              placeholder="Add a comment..."
              rows={3}
              size="m"
            />
            <Button
              type="submit"
              view="action"
              size="m"
              disabled={loading || !newComment.trim()}
              loading={loading}
            >
              Add Comment
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
