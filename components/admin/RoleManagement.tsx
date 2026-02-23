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
  TextInput,
  TextArea,
  Table,
} from "@gravity-ui/uikit"

interface Role {
  id: string
  name: string
  description: string | null
  rolePermissions: Array<{
    permission: {
      id: string
      name: string
      description: string | null
    }
  }>
}

interface Permission {
  id: string
  name: string
  description: string | null
}

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")

  useEffect(() => {
    loadRoles()
  }, [])

  useEffect(() => {
    if (roles.length > 0) {
      const allPermissions = new Map<string, Permission>()
      roles.forEach((role) => {
        role.rolePermissions.forEach((rp) => {
          if (!allPermissions.has(rp.permission.id)) {
            allPermissions.set(rp.permission.id, rp.permission)
          }
        })
      })
      setPermissions(Array.from(allPermissions.values()))
    }
  }, [roles])

  const loadRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Failed to load roles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPermissions = (role: Role) => {
    setEditingRole(role)
    setSelectedPermissions(role.rolePermissions.map((rp) => rp.permission.id))
  }

  const handleSavePermissions = async () => {
    if (!editingRole) return
    try {
      const response = await fetch(`/api/roles/${editingRole.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: selectedPermissions }),
      })
      if (response.ok) {
        await loadRoles()
        setEditingRole(null)
        setSelectedPermissions([])
      }
    } catch (error) {
      console.error("Failed to update role permissions:", error)
    }
  }

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDescription || null,
        }),
      })
      if (response.ok) {
        await loadRoles()
        setShowCreateModal(false)
        setNewRoleName("")
        setNewRoleDescription("")
      }
    } catch (error) {
      console.error("Failed to create role:", error)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return
    try {
      const response = await fetch(`/api/roles/${roleId}`, { method: "DELETE" })
      if (response.ok) {
        await loadRoles()
      }
    } catch (error) {
      console.error("Failed to delete role:", error)
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <Text variant="header-2">Role Management</Text>
        <Button view="action" size="m" onClick={() => setShowCreateModal(true)}>
          + Create Role
        </Button>
      </div>

      <Card view="outlined" style={{ overflow: "hidden" }}>
        <Table
          data={roles}
          columns={[
            {
              id: "role",
              name: "Role",
              template: (role: Role) => (
                <div>
                  <Text variant="body-2" style={{ fontWeight: 500 }}>
                    {role.name}
                  </Text>
                  {role.description && (
                    <>
                      <br />
                      <Text variant="caption-2" color="secondary">
                        {role.description}
                      </Text>
                    </>
                  )}
                </div>
              ),
            },
            {
              id: "permissions",
              name: "Permissions",
              template: (role: Role) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {role.rolePermissions.map((rp) => (
                    <Label key={rp.permission.id} theme="success" size="xs">
                      {rp.permission.name}
                    </Label>
                  ))}
                </div>
              ),
            },
            {
              id: "actions",
              name: "Actions",
              template: (role: Role) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    view="outlined"
                    size="s"
                    onClick={() => handleEditPermissions(role)}
                  >
                    Edit Permissions
                  </Button>
                  <Button
                    view="outlined-danger"
                    size="s"
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Edit Permissions Modal */}
      {editingRole && (
        <Modal open onClose={() => { setEditingRole(null); setSelectedPermissions([]) }}>
          <Card style={{ width: 560, maxHeight: "80vh", overflowY: "auto", padding: 24 }} view="clear">
            <Text variant="header-1" style={{ marginBottom: 20, display: "block" }}>
              Edit Permissions for {editingRole.name}
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {permissions.map((permission) => (
                <Checkbox
                  key={permission.id}
                  checked={selectedPermissions.includes(permission.id)}
                  onUpdate={(checked) => {
                    if (checked) {
                      setSelectedPermissions([...selectedPermissions, permission.id])
                    } else {
                      setSelectedPermissions(selectedPermissions.filter((id) => id !== permission.id))
                    }
                  }}
                >
                  <Text variant="body-2">{permission.name}</Text>
                  {permission.description && (
                    <Text variant="caption-2" color="secondary">
                      {" "}— {permission.description}
                    </Text>
                  )}
                </Checkbox>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button
                view="outlined"
                size="l"
                onClick={() => { setEditingRole(null); setSelectedPermissions([]) }}
              >
                Cancel
              </Button>
              <Button view="action" size="l" onClick={handleSavePermissions}>
                Save
              </Button>
            </div>
          </Card>
        </Modal>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <Modal open onClose={() => { setShowCreateModal(false); setNewRoleName(""); setNewRoleDescription("") }}>
          <Card style={{ width: 440, padding: 24 }} view="clear">
            <Text variant="header-1" style={{ marginBottom: 20, display: "block" }}>
              Create New Role
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
              <TextInput
                label="Role Name"
                value={newRoleName}
                onUpdate={setNewRoleName}
                placeholder="Role name"
                size="l"
                hasClear
              />
              <TextArea
                value={newRoleDescription}
                onUpdate={setNewRoleDescription}
                placeholder="Role description (optional)"
                rows={3}
                size="l"
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button
                view="outlined"
                size="l"
                onClick={() => { setShowCreateModal(false); setNewRoleName(""); setNewRoleDescription("") }}
              >
                Cancel
              </Button>
              <Button
                view="action"
                size="l"
                onClick={handleCreateRole}
                disabled={!newRoleName.trim()}
              >
                Create
              </Button>
            </div>
          </Card>
        </Modal>
      )}
    </div>
  )
}
