"use client"

import React, { useMemo, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import type { TaskStatus, TaskPriority } from "@prisma/client"
import type { TaskWithRelations } from "@/lib/types"
import { SortableTaskCard } from "./SortableTaskCard"
import { TaskCard } from "./TaskCard"
import { useTaskStore } from "@/store/taskStore"
import { Text, Label, Button, TextInput } from "@gravity-ui/uikit"

const DONE_VISIBLE_LIMIT = 5

interface TaskBoardProps {
  tasks: TaskWithRelations[]
  onTaskClick: (task: TaskWithRelations) => void
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void
  onTaskDelete?: (taskId: string) => void
  onQuickCreate?: (data: {
    title: string
    priority: TaskPriority
    status?: TaskStatus
  }) => Promise<void>
}

const statusColumns: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

const columnConfig: Record<TaskStatus, { label: string; labelTheme: "info" | "warning" | "success" }> = {
  TODO: { label: "To Do", labelTheme: "info" },
  IN_PROGRESS: { label: "In Progress", labelTheme: "warning" },
  DONE: { label: "Done", labelTheme: "success" },
}

export function TaskBoard({ tasks, onTaskClick, onTaskMove, onTaskDelete, onQuickCreate }: TaskBoardProps) {
  const { filters } = useTaskStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false
      if (filters.priority && task.priority !== filters.priority) return false
      if (filters.assignedTo && task.assignedToId !== filters.assignedTo) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !task.title.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower)
        )
          return false
      }
      return true
    })
  }, [tasks, filters])

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, TaskWithRelations[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    }
    filteredTasks.forEach((task) => {
      grouped[task.status].push(task)
    })
    return grouped
  }, [filteredTasks])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const taskId = active.id as string
    const newStatus = over.id as TaskStatus
    if (!statusColumns.includes(newStatus)) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return
    onTaskMove(taskId, newStatus)
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {statusColumns.map((status) => (
          <StatusColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
            onTaskDelete={onTaskDelete}
            onQuickCreate={onQuickCreate}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div style={{ opacity: 0.8, transform: "rotate(2deg)" }}>
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function StatusColumn({
  status,
  tasks,
  onTaskClick,
  onTaskDelete,
  onQuickCreate,
}: {
  status: TaskStatus
  tasks: TaskWithRelations[]
  onTaskClick: (task: TaskWithRelations) => void
  onTaskDelete?: (taskId: string) => void
  onQuickCreate?: (data: {
    title: string
    priority: TaskPriority
    status?: TaskStatus
  }) => Promise<void>
}) {
  const { setNodeRef } = useDroppable({ id: status })
  const config = columnConfig[status]
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [showArchive, setShowArchive] = useState(false)

  // DONE: показываем только последние DONE_VISIBLE_LIMIT, остальные — архив
  const visibleTasks = status === "DONE" && !showArchive
    ? tasks.slice(0, DONE_VISIBLE_LIMIT)
    : tasks
  const archivedCount = status === "DONE" ? Math.max(0, tasks.length - DONE_VISIBLE_LIMIT) : 0

  const handleQuickAdd = async () => {
    if (!newTitle.trim() || !onQuickCreate) return
    setSaving(true)
    try {
      await onQuickCreate({ title: newTitle.trim(), priority: "MEDIUM", status })
      setNewTitle("")
      setIsAdding(false)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleQuickAdd()
    if (e.key === "Escape") {
      setIsAdding(false)
      setNewTitle("")
    }
  }

  return (
    <div
      ref={setNodeRef}
      id={status}
      style={{
        background: "var(--g-color-base-generic)",
        borderRadius: 8,
        padding: 12,
        border: "1px solid var(--g-color-line-generic)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Text variant="subheader-2">{config.label}</Text>
        <Label theme={config.labelTheme} size="xs">
          {tasks.length}
        </Label>
      </div>

      {/* Скроллируемый список задач */}
      <SortableContext items={visibleTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            overflowY: "auto",
            maxHeight: "calc(100vh - 320px)",
            minHeight: 80,
            paddingRight: 2,
          }}
        >
          {visibleTasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onDelete={onTaskDelete ? () => onTaskDelete(task.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>

      {/* Кнопка архива для DONE */}
      {status === "DONE" && archivedCount > 0 && (
        <Button
          view="flat"
          size="s"
          width="max"
          onClick={() => setShowArchive((v) => !v)}
          style={{ marginTop: 8, color: "var(--g-color-text-hint)" }}
        >
          {showArchive ? "▲ Скрыть архив" : `▼ Архив (${archivedCount})`}
        </Button>
      )}

      {/* Inline quick-add */}
      {onQuickCreate && (
        <div style={{ marginTop: 8 }}>
          {isAdding ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <TextInput
                value={newTitle}
                onUpdate={setNewTitle}
                placeholder="Task title..."
                size="m"
                autoFocus
                onKeyDown={handleKeyDown}
                hasClear
              />
              <div style={{ display: "flex", gap: 6 }}>
                <Button
                  view="action"
                  size="s"
                  onClick={handleQuickAdd}
                  loading={saving}
                  disabled={saving || !newTitle.trim()}
                >
                  Add
                </Button>
                <Button
                  view="flat"
                  size="s"
                  onClick={() => {
                    setIsAdding(false)
                    setNewTitle("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              view="flat"
              size="s"
              width="max"
              onClick={() => setIsAdding(true)}
              style={{ color: "var(--g-color-text-hint)" }}
            >
              + Add task
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
