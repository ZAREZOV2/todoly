"use client"

import { TaskWithRelations } from "@/lib/types"
import { TaskStatus, TaskPriority } from "@prisma/client"

interface TaskCardProps {
  task: TaskWithRelations
  onClick: () => void
}

const priorityColors = {
  HIGH: "bg-red-100 text-red-800 border-red-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
  LOW: "bg-green-100 text-green-800 border-green-300",
}

const priorityLabels = {
  HIGH: "🔴 High",
  MEDIUM: "🟡 Medium",
  LOW: "🟢 Low",
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1">{task.title}</h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded border ${priorityColors[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {task.assignedTo && (
            <span className="truncate max-w-[100px]">
              👤 {task.assignedTo.name || task.assignedTo.email}
            </span>
          )}
          {task.comments.length > 0 && (
            <span>💬 {task.comments.length}</span>
          )}
        </div>
        <span>
          {new Date(task.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
