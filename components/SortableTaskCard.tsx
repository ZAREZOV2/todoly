"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { TaskWithRelations } from "@/lib/types"
import { TaskCard } from "./TaskCard"

interface SortableTaskCardProps {
  task: TaskWithRelations
  onClick: () => void
  onDelete?: (e: React.MouseEvent) => void
  delay?: number
}

export function SortableTaskCard({ task, onClick, onDelete }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} onDelete={onDelete} />
    </div>
  )
}
