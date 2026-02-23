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
import type { TaskStatus } from "@prisma/client"
import type { TaskWithRelations } from "@/lib/types"
import { SortableTaskCard } from "./SortableTaskCard"
import { TaskCard } from "./TaskCard"
import { useTaskStore } from "@/store/taskStore"
import { Text, Label } from "@gravity-ui/uikit"

interface TaskBoardProps {
  tasks: TaskWithRelations[]
  onTaskClick: (task: TaskWithRelations) => void
  onTaskMove: (taskId: string, newStatus: TaskStatus) => Promise<void>
}

const statusColumns: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

const columnConfig: Record<TaskStatus, { label: string; labelTheme: "info" | "warning" | "success" }> = {
  TODO: { label: "To Do", labelTheme: "info" },
  IN_PROGRESS: { label: "In Progress", labelTheme: "warning" },
  DONE: { label: "Done", labelTheme: "success" },
}

export function TaskBoard({ tasks, onTaskClick, onTaskMove }: TaskBoardProps) {
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const taskId = active.id as string
    const newStatus = over.id as TaskStatus
    if (!statusColumns.includes(newStatus)) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return
    await onTaskMove(taskId, newStatus)
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {statusColumns.map((status) => (
          <StatusColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
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
}: {
  status: TaskStatus
  tasks: TaskWithRelations[]
  onTaskClick: (task: TaskWithRelations) => void
}) {
  const { setNodeRef } = useDroppable({ id: status })
  const config = columnConfig[status]

  return (
    <div
      ref={setNodeRef}
      id={status}
      style={{
        background: "var(--g-color-base-generic)",
        borderRadius: 8,
        padding: 12,
        minHeight: 400,
        border: "1px solid var(--g-color-line-generic)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Text variant="subheader-2">{config.label}</Text>
        <Label theme={config.labelTheme} size="xs">
          {tasks.length}
        </Label>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
