import type { TaskStatus, TaskPriority } from "@prisma/client"

export type { TaskStatus, TaskPriority }

export interface TaskWithRelations {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  order: number
  dueDate: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  creatorId: string
  assignedToId: string | null
  creator: {
    id: string
    email: string
    name: string | null
  }
  assignedTo: {
    id: string
    email: string
    name: string | null
  } | null
  comments: Array<{
    id: string
    content: string
    createdAt: Date | string
    updatedAt: Date | string
    author: {
      id: string
      email: string
      name: string | null
    }
  }>
}

export interface UserWithRoles {
  id: string
  email: string
  name: string | null
  role: string
}
