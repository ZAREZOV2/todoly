import { create } from "zustand"
import { TaskStatus, TaskPriority } from "@prisma/client"
import { TaskWithRelations } from "@/lib/types"

interface TaskStore {
  tasks: TaskWithRelations[]
  setTasks: (tasks: TaskWithRelations[]) => void
  addTask: (task: TaskWithRelations) => void
  updateTask: (id: string, task: Partial<TaskWithRelations>) => void
  removeTask: (id: string) => void
  filters: {
    status: TaskStatus | null
    priority: TaskPriority | null
    assignedTo: string | null
    search: string
  }
  setFilter: (filter: Partial<TaskStore["filters"]>) => void
  clearFilters: () => void
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  filters: {
    status: null,
    priority: null,
    assignedTo: null,
    search: "",
  },
  setFilter: (filter) =>
    set((state) => ({
      filters: { ...state.filters, ...filter },
    })),
  clearFilters: () =>
    set({
      filters: {
        status: null,
        priority: null,
        assignedTo: null,
        search: "",
      },
    }),
}))
