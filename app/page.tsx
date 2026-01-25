"use client"

import { useEffect, useState } from "react"
import React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { TaskWithRelations } from "@/lib/types"
import { TaskStatus, TaskPriority } from "@prisma/client"
import { useTaskStore } from "@/store/taskStore"
import { TaskBoard } from "@/components/TaskBoard"
import { TaskModal } from "@/components/TaskModal"
import { Filters } from "@/components/Filters"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { tasks, setTasks, updateTask, removeTask } = useTaskStore()
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(
    null
  )
  const [users, setUsers] = useState<
    Array<{ id: string; email: string; name: string | null }>
  >([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      loadTasks()
      loadUsers()
    }
  }, [status, router])

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Failed to load tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      // Users endpoint requires admin permission, so this might fail
      // We'll use a fallback or just continue without users list
      console.log("Could not load users (may require admin permission)")
    }
  }

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task)
  }

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updated = await response.json()
        updateTask(taskId, updated)
      }
    } catch (error) {
      console.error("Failed to move task:", error)
    }
  }

  const handleTaskUpdate = async (
    id: string,
    updates: Partial<TaskWithRelations>
  ) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updated = await response.json()
        updateTask(id, updated)
        setSelectedTask(updated)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
      throw error
    }
  }

  const handleTaskDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        removeTask(id)
        setSelectedTask(null)
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
      throw error
    }
  }

  const handleCreateTask = async (taskData: {
    title: string
    description?: string
    priority: TaskPriority
    assignedToId?: string
  }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        const newTask = await response.json()
        useTaskStore.getState().addTask(newTask)
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const canCreate = session?.user?.permissions?.includes("tasks.create")
  const canManageUsers = session?.user?.permissions?.includes("users.manage")
  const canManageRoles = session?.user?.permissions?.includes("roles.manage")

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              TODO Development Platform
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session?.user?.email}
              </span>
              {(canManageUsers || canManageRoles) && (
                <a
                  href="/admin"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Admin Panel
                </a>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Task Board</h2>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + New Task
            </button>
          )}
        </div>

        <Filters />

        <TaskBoard
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onTaskMove={handleTaskMove}
        />

        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
            users={users}
          />
        )}

        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateTask}
            users={users}
          />
        )}
      </div>
    </div>
  )
}

function CreateTaskModal({
  onClose,
  onCreate,
  users,
}: {
  onClose: () => void
  onCreate: (data: {
    title: string
    description?: string
    priority: TaskPriority
    assignedToId?: string
  }) => Promise<void>
  users: Array<{ id: string; email: string; name: string | null }>
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM")
  const [assignedToId, setAssignedToId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onCreate({
        title,
        description: description || undefined,
        priority,
        assignedToId: assignedToId || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
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
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {users.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To
                </label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
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
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
