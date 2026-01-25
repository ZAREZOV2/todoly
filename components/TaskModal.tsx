"use client"

import { useState, useEffect } from "react"
import { TaskWithRelations } from "@/lib/types"
import { TaskStatus, TaskPriority } from "@prisma/client"
import { useSession } from "next-auth/react"
import { CommentSection } from "./CommentSection"

interface TaskModalProps {
  task: TaskWithRelations | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<TaskWithRelations>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  users: Array<{ id: string; email: string; name: string | null }>
}

const priorityOptions: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"]
const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"]

export function TaskModal({
  task,
  onClose,
  onUpdate,
  onDelete,
  users,
}: TaskModalProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("TODO")
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM")
  const [assignedToId, setAssignedToId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canEdit = session?.user?.permissions?.includes("tasks.update")
  const canDelete = session?.user?.permissions?.includes("tasks.delete")
  const canAssign = session?.user?.permissions?.includes("tasks.assign")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setStatus(task.status)
      setPriority(task.priority)
      setAssignedToId(task.assignedToId)
    }
  }, [task])

  if (!task) return null

  const handleSave = async () => {
    setLoading(true)
    try {
      await onUpdate(task.id, {
        title,
        description: description || null,
        status,
        priority,
        assignedToId: assignedToId || null,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update task:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return
    setLoading(true)
    try {
      await onDelete(task.id)
      onClose()
    } catch (error) {
      console.error("Failed to delete task:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Task" : "Task Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {priorityOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {canAssign && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={assignedToId || ""}
                    onChange={(e) =>
                      setAssignedToId(e.target.value || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading || !title.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600 mt-2">{task.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>{" "}
                  <span className="text-gray-900">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>{" "}
                  <span className="text-gray-900">{task.priority}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created by:</span>{" "}
                  <span className="text-gray-900">
                    {task.creator.name || task.creator.email}
                  </span>
                </div>
                {task.assignedTo && (
                  <div>
                    <span className="font-medium text-gray-700">Assigned to:</span>{" "}
                    <span className="text-gray-900">
                      {task.assignedTo.name || task.assignedTo.email}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>

              <CommentSection taskId={task.id} comments={task.comments} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
