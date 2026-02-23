"use client"

import { useState, useEffect } from "react"
import type { TaskWithRelations } from "@/lib/types"
import type { TaskStatus, TaskPriority } from "@prisma/client"
import { useSessionWithPermissions } from "@/lib/use-session"
import { CommentSection } from "./CommentSection"
import {
  Button,
  Modal,
  Card,
  Text,
  TextInput,
  TextArea,
  Select,
  Label,
} from "@gravity-ui/uikit"

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toISOString().split("T")[0]
}

function formatDisplayDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString()
}

function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

interface TaskModalProps {
  task: TaskWithRelations | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<TaskWithRelations>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  users: Array<{ id: string; email: string; name: string | null }>
}

const priorityOptions: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"]
const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

const priorityTheme: Record<string, "danger" | "warning" | "success"> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "success",
}

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
}

export function TaskModal({ task, onClose, onUpdate, onDelete, users }: TaskModalProps) {
  const { data: session } = useSessionWithPermissions()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("TODO")
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM")
  const [assignedToId, setAssignedToId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<string>("")
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
      setDueDate(formatDate(task.dueDate))
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
        dueDate: (dueDate || null) as any,
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
    <Modal open onClose={onClose}>
      <Card
        style={{
          width: 640,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 24,
        }}
        view="clear"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <Text variant="header-1">
            {isEditing ? "Edit Task" : "Task Details"}
          </Text>
          <Button view="flat" size="m" onClick={onClose}>
            ✕
          </Button>
        </div>

        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TextInput
              label="Title"
              value={title}
              onUpdate={setTitle}
              placeholder="Task title"
              size="l"
              hasClear
            />

            <TextArea
              value={description}
              onUpdate={setDescription}
              placeholder="Task description"
              rows={4}
              size="l"
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Select
                label="Status"
                value={[status]}
                onUpdate={(vals) => setStatus(vals[0] as TaskStatus)}
                size="l"
                width="max"
                options={statusOptions.map((s) => ({ value: s, content: statusLabels[s] }))}
              />

              <Select
                label="Priority"
                value={[priority]}
                onUpdate={(vals) => setPriority(vals[0] as TaskPriority)}
                size="l"
                width="max"
                options={priorityOptions.map((p) => ({ value: p, content: p }))}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {canAssign && (
                <Select
                  label="Assign To"
                  value={assignedToId ? [assignedToId] : []}
                  onUpdate={(vals) => setAssignedToId(vals[0] || null)}
                  size="l"
                  width="max"
                  options={[
                    { value: "", content: "Unassigned" },
                    ...users.map((user) => ({ value: user.id, content: user.name || user.email })),
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
              <Button view="outlined" size="l" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                view="action"
                size="l"
                onClick={handleSave}
                loading={loading}
                disabled={loading || !title.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <Text variant="subheader-3">{task.title}</Text>
              {task.description && (
                <Text variant="body-2" color="secondary" style={{ marginTop: 8, display: "block" }}>
                  {task.description}
                </Text>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text variant="body-2" color="secondary">Status:</Text>
                <Text variant="body-2">{statusLabels[task.status]}</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text variant="body-2" color="secondary">Priority:</Text>
                <Label theme={priorityTheme[task.priority]} size="s">
                  {task.priority}
                </Label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text variant="body-2" color="secondary">Created by:</Text>
                <Text variant="body-2">{task.creator.name || task.creator.email}</Text>
              </div>
              {task.assignedTo && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text variant="body-2" color="secondary">Assigned to:</Text>
                  <Text variant="body-2">{task.assignedTo.name || task.assignedTo.email}</Text>
                </div>
              )}
              {task.dueDate && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text variant="body-2" color="secondary">Due:</Text>
                  <Text
                    variant="body-2"
                    style={{
                      color: isOverdue(task.dueDate) && task.status !== "DONE"
                        ? "var(--g-color-text-danger)"
                        : undefined,
                    }}
                  >
                    {formatDisplayDate(task.dueDate)}
                    {isOverdue(task.dueDate) && task.status !== "DONE" && " — Overdue"}
                  </Text>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {canEdit && (
                <Button view="action" size="m" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  view="outlined-danger"
                  size="m"
                  onClick={handleDelete}
                  loading={loading}
                  disabled={loading}
                >
                  Delete
                </Button>
              )}
            </div>

            <CommentSection taskId={task.id} comments={task.comments} />
          </div>
        )}
      </Card>
    </Modal>
  )
}
