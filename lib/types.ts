import type { TaskStatus, TaskPriority } from "@prisma/client"

export type { TaskStatus, TaskPriority }

export interface TaskWithRelations {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  createdAt: Date
  updatedAt: Date
  creatorId: string
  assignedToId: string | null
  order: number
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
    createdAt: Date
    updatedAt: Date
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
  userRoles: Array<{
    role: {
      id: string
      name: string
      rolePermissions: Array<{
        permission: {
          id: string
          name: string
        }
      }>
    }
  }>
}
