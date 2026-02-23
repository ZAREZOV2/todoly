"use client"

import type { TaskWithRelations } from "@/lib/types"
import { Card, Text, Label, Button } from "@gravity-ui/uikit"

function isOverdue(date: Date | string | null | undefined, status: string): boolean {
  if (!date || status === "DONE") return false
  return new Date(date) < new Date()
}

interface TaskCardProps {
  task: TaskWithRelations
  onClick: () => void
  onDelete?: (e: React.MouseEvent) => void
  delay?: number
}

const priorityTheme: Record<string, "danger" | "warning" | "success"> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "success",
}

const priorityLabels: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
}

export function TaskCard({ task, onClick, onDelete }: TaskCardProps) {
  return (
    <Card
      onClick={onClick}
      view="outlined"
      style={{
        padding: 12,
        cursor: "pointer",
        transition: "box-shadow 0.15s ease",
      }}
      className="task-card-hover"
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
        <Text variant="body-2" style={{ fontWeight: 500, flex: 1 }}>
          {task.title}
        </Text>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Label theme={priorityTheme[task.priority]} size="xs">
            {priorityLabels[task.priority]}
          </Label>
          {onDelete && (
            <Button
              view="flat"
              size="xs"
              onClick={(e) => { e.stopPropagation(); onDelete(e) }}
              style={{ color: "var(--g-color-text-hint)", minWidth: 20, height: 20, padding: "0 4px" }}
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {task.description && (
        <Text
          variant="body-1"
          color="secondary"
          style={{
            marginBottom: 10,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.description}
        </Text>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {task.assignedTo && (
            <Text variant="caption-2" color="secondary" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              @ {task.assignedTo.name || task.assignedTo.email}
            </Text>
          )}
          {task.comments.length > 0 && (
            <Text variant="caption-2" color="secondary">
              💬 {task.comments.length}
            </Text>
          )}
          {task.dueDate && (
            <Text
              variant="caption-2"
              style={{
                color: isOverdue(task.dueDate, task.status)
                  ? "var(--g-color-text-danger)"
                  : "var(--g-color-text-hint)",
              }}
            >
              📅 {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          )}
        </div>
        <Text variant="caption-2" color="hint">
          {new Date(task.updatedAt).toLocaleDateString()}
        </Text>
      </div>
    </Card>
  )
}
