"use client"

import { useEffect, useState } from "react"
import {
  Button,
  Card,
  Text,
  Label,
  Modal,
  Checkbox,
  Spin,
  Table,
} from "@gravity-ui/uikit"

interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
  userRoles: Array<{
    role: {
      id: string
      name: string
      description: string | null
    }
  }>
}

interface Role {
  id: string
  name: string
  description: string | null
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Failed to load roles:", error)
    }
  }

  const handleEditRoles = (user: User) => {
    setEditingUser(user)
    setSelectedRoles(user.userRoles.map((ur) => ur.role.id))
  }

  const handleSaveRoles = async () => {
    if (!editingUser) return
    try {
      const response = await fetch(`/api/users/${editingUser.id}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: selectedRoles }),
      })
      if (response.ok) {
        await loadUsers()
        setEditingUser(null)
        setSelectedRoles([])
      }
    } catch (error) {
      console.error("Failed to update user roles:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" })
      if (response.ok) {
        await loadUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin size="l" />
      </div>
    )
  }

  return (
    <div>
      <Text variant="header-2" style={{ marginBottom: 20, display: "block" }}>
        User Management
      </Text>

      <Card view="outlined" style={{ overflow: "hidden" }}>
        <Table
          data={users}
          columns={[
            {
              id: "user",
              name: "User",
              template: (user: User) => (
                <div>
                  <Text variant="body-2" style={{ fontWeight: 500 }}>
                    {user.name || user.email}
                  </Text>
                  <br />
                  <Text variant="caption-2" color="secondary">
                    {user.email}
                  </Text>
                </div>
              ),
            },
            {
              id: "roles",
              name: "Roles",
              template: (user: User) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {user.userRoles.map((ur) => (
                    <Label key={ur.role.id} theme="info" size="xs">
                      {ur.role.name}
                    </Label>
                  ))}
                </div>
              ),
            },
            {
              id: "created",
              name: "Created",
              template: (user: User) => (
                <Text variant="body-2" color="secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              ),
            },
            {
              id: "actions",
              name: "Actions",
              template: (user: User) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    view="outlined"
                    size="s"
                    onClick={() => handleEditRoles(user)}
                  >
                    Edit Roles
                  </Button>
                  <Button
                    view="outlined-danger"
                    size="s"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {editingUser && (
        <Modal open onClose={() => { setEditingUser(null); setSelectedRoles([]) }}>
          <Card style={{ width: 440, padding: 24 }} view="clear">
            <Text variant="header-1" style={{ marginBottom: 20, display: "block" }}>
              Edit Roles for {editingUser.name || editingUser.email}
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {roles.map((role) => (
                <Checkbox
                  key={role.id}
                  checked={selectedRoles.includes(role.id)}
                  onUpdate={(checked) => {
                    if (checked) {
                      setSelectedRoles([...selectedRoles, role.id])
                    } else {
                      setSelectedRoles(selectedRoles.filter((id) => id !== role.id))
                    }
                  }}
                >
                  <Text variant="body-2">{role.name}</Text>
                  {role.description && (
                    <Text variant="caption-2" color="secondary">
                      {" "}— {role.description}
                    </Text>
                  )}
                </Checkbox>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button
                view="outlined"
                size="l"
                onClick={() => { setEditingUser(null); setSelectedRoles([]) }}
              >
                Cancel
              </Button>
              <Button view="action" size="l" onClick={handleSaveRoles}>
                Save
              </Button>
            </div>
          </Card>
        </Modal>
      )}
    </div>
  )
}
