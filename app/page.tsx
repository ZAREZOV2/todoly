"use client"

import { useEffect, useState } from "react"
import React from "react"
import { useSessionWithPermissions } from "@/lib/use-session"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import type { TaskWithRelations } from "@/lib/types"
import type { TaskStatus, TaskPriority } from "@prisma/client"
import { useTaskStore } from "@/store/taskStore"
import { useAppTheme } from "@/components/GravityProvider"
import { TaskBoard } from "@/components/TaskBoard"
import { TaskModal } from "@/components/TaskModal"
import { Filters } from "@/components/Filters"
import {
  Button,
  Text,
  Modal,
  TextInput,
  TextArea,
  Select,
  Spin,
  Card,
} from "@gravity-ui/uikit"

export default function HomePage() {
  const { data: session, status } = useSessionWithPermissions()
  const router = useRouter()
  const { tasks, setTasks, updateTask, removeTask } = useTaskStore()
  const { theme, toggleTheme } = useAppTheme()
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null)
  const [users, setUsers] = useState<Array<{ id: string; email: string; name: string | null }>>([])
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
    } catch {
      // may require admin permission
    }
  }

  const handleTaskClick = (task: TaskWithRelations) => setSelectedTask(task)

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

  const handleTaskUpdate = async (id: string, updates: Partial<TaskWithRelations>) => {
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
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
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
    status?: TaskStatus
    assignedToId?: string
    dueDate?: string
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--g-color-base-background)",
        }}
      >
        <Spin size="xl" />
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--g-color-base-background)" }}>
      {/* Navigation */}
      <div
        style={{
          background: "var(--g-color-base-float)",
          borderBottom: "1px solid var(--g-color-line-generic)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text variant="header-1">Todoly</Text>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Text variant="body-2" color="secondary">
              {session?.user?.name || session?.user?.email}
            </Text>
            <Button
              view="flat"
              size="m"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </Button>
            <Button view="outlined" size="m" href="/profile">
              Profile
            </Button>
            {(canManageUsers || canManageRoles) && (
              <Button view="outlined" size="m" href="/admin">
                Admin
              </Button>
            )}
            <Button
              view="outlined"
              size="m"
              onClick={async () => {
                await authClient.signOut()
                window.location.href = "/login"
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text variant="header-2">Task Board</Text>
          {canCreate && (
            <Button view="action" size="m" onClick={() => setShowCreateModal(true)}>
              + New Task
            </Button>
          )}
        </div>

        <Filters users={users} />

        <TaskBoard
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onTaskMove={handleTaskMove}
          onQuickCreate={canCreate ? handleCreateTask : undefined}
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
    status?: TaskStatus
    assignedToId?: string
    dueDate?: string
  }) => Promise<void>
  users: Array<{ id: string; email: string; name: string | null }>
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM")
  const [status, setStatus] = useState<TaskStatus>("TODO")
  const [assignedToId, setAssignedToId] = useState<string>("")
  const [dueDate, setDueDate] = useState<string>("")
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
        status,
        assignedToId: assignedToId || undefined,
        dueDate: dueDate || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose}>
      <Card style={{ width: 560, padding: 24 }} view="clear">
        <Text variant="header-1" style={{ marginBottom: 20, display: "block" }}>
          Create New Task
        </Text>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TextInput
              label="Title"
              value={title}
              onUpdate={setTitle}
              placeholder="Task title"
              size="l"
              hasClear
              autoFocus
            />

            <TextArea
              value={description}
              onUpdate={setDescription}
              placeholder="Task description (optional)"
              rows={3}
              size="l"
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Select
                label="Status"
                value={[status]}
                onUpdate={(vals) => setStatus(vals[0] as TaskStatus)}
                size="l"
                width="max"
              >
                <Select.Option value="TODO">To Do</Select.Option>
                <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
                <Select.Option value="DONE">Done</Select.Option>
              </Select>

              <Select
                label="Priority"
                value={[priority]}
                onUpdate={(vals) => setPriority(vals[0] as TaskPriority)}
                size="l"
                width="max"
              >
                <Select.Option value="HIGH">High</Select.Option>
                <Select.Option value="MEDIUM">Medium</Select.Option>
                <Select.Option value="LOW">Low</Select.Option>
              </Select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {users.length > 0 && (
                <Select
                  label="Assign To"
                  value={assignedToId ? [assignedToId] : []}
                  onUpdate={(vals) => setAssignedToId(vals[0] ?? "")}
                  size="l"
                  width="max"
                  options={[
                    { value: "", content: "Unassigned" },
                    ...users.map((user) => ({
                      value: user.id,
                      content: user.name || user.email,
                    })),
                  ]}
                />
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Text variant="body-2" color="secondary">Due Date</Text>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    height: 36,
                    padding: "0 12px",
                    borderRadius: 6,
                    border: "1px solid var(--g-color-line-generic)",
                    background: "var(--g-color-base-background)",
                    color: "var(--g-color-text-primary)",
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button view="outlined" size="l" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                view="action"
                size="l"
                loading={loading}
                disabled={loading || !title.trim()}
              >
                Create Task
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </Modal>
  )
}
