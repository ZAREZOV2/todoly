"use client"

import { useState } from "react"
import { useSessionWithPermissions } from "@/lib/use-session"
import type { TaskWithRelations } from "@/lib/types"

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
        setComments(
          comments.map((c) => (c.id === id ? updated : c))
        )
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
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const isOwnComment = (comment: typeof comments[0]) => {
    return comment.author.id === session?.user?.id
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="font-semibold text-gray-900 mb-4">Comments ({comments.length})</h4>

      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
            {editingId === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  placeholder="Edit comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditContent("")
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">
                      {comment.author.name || comment.author.email}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {(isOwnComment(comment) || canUpdate || canDelete) && (
                    <div className="flex gap-2">
                      {(isOwnComment(comment) || canUpdate) && (
                        <button
                          onClick={() => {
                            setEditingId(comment.id)
                            setEditContent(comment.content)
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Edit
                        </button>
                      )}
                      {(isOwnComment(comment) || canDelete) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {canCreate && (
        <form onSubmit={handleAddComment} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Comment"}
          </button>
        </form>
      )}
    </div>
  )
}
