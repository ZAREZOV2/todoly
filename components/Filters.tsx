"use client"

import type { TaskStatus, TaskPriority } from "@prisma/client"
import { useTaskStore } from "@/store/taskStore"
import {
  Button,
  Card,
  TextInput,
  Select,
} from "@gravity-ui/uikit"

interface FiltersProps {
  users?: Array<{ id: string; email: string; name: string | null }>
}

export function Filters({ users = [] }: FiltersProps) {
  const { filters, setFilter, clearFilters } = useTaskStore()

  return (
    <Card view="outlined" style={{ padding: "12px 16px", marginBottom: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: users.length > 0 ? "1fr 1fr 1fr 1fr auto" : "1fr 1fr 1fr auto",
          gap: 12,
          alignItems: "flex-end",
        }}
      >
        <TextInput
          label="Search"
          value={filters.search}
          onUpdate={(val) => setFilter({ search: val })}
          placeholder="Search tasks..."
          size="m"
          hasClear
        />

        <Select
          label="Status"
          value={filters.status ? [filters.status] : []}
          onUpdate={(vals) =>
            setFilter({ status: (vals[0] as TaskStatus) || null })
          }
          size="m"
          width="max"
          placeholder="All Statuses"
        >
          <Select.Option value="TODO">To Do</Select.Option>
          <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
          <Select.Option value="DONE">Done</Select.Option>
        </Select>

        <Select
          label="Priority"
          value={filters.priority ? [filters.priority] : []}
          onUpdate={(vals) =>
            setFilter({ priority: (vals[0] as TaskPriority) || null })
          }
          size="m"
          width="max"
          placeholder="All Priorities"
        >
          <Select.Option value="HIGH">High</Select.Option>
          <Select.Option value="MEDIUM">Medium</Select.Option>
          <Select.Option value="LOW">Low</Select.Option>
        </Select>

        {users.length > 0 && (
          <Select
            label="Assignee"
            value={filters.assignedTo ? [filters.assignedTo] : []}
            onUpdate={(vals) => setFilter({ assignedTo: vals[0] || null })}
            size="m"
            width="max"
            placeholder="All Assignees"
          >
            {users.map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.name || user.email}
              </Select.Option>
            ))}
          </Select>
        )}

        <Button view="outlined" size="m" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </Card>
  )
}
