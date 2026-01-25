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
import { TaskStatus } from "@prisma/client"
import { TaskWithRelations } from "@/lib/types"
import { SortableTaskCard } from "./SortableTaskCard"
import { TaskCard } from "./TaskCard"
import { useTaskStore } from "@/store/taskStore"

interface TaskBoardProps {
  tasks: TaskWithRelations[]
  onTaskClick: (task: TaskWithRelations) => void
  onTaskMove: (taskId: string, newStatus: TaskStatus) => Promise<void>
}

const statusColumns: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"]

export function TaskBoard({
  tasks,
  onTaskClick,
  onTaskMove,
}: TaskBoardProps) {
  const { filters } = useTaskStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false
      if (filters.priority && task.priority !== filters.priority) return false
      if (filters.assignedTo && task.assignedToId !== filters.assignedTo)
        return false
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
      REVIEW: [],
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

  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="opacity-50 rotate-3">
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
  const { setNodeRef } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      id={status}
      className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
    >
      <h3 className="font-semibold text-gray-900 mb-4">
        {status.replace("_", " ")} ({tasks.length})
      </h3>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
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
