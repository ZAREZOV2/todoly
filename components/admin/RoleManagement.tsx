"use client"

import { useEffect, useState } from "react"

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
    loadPermissions()
  }, [])

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

  const loadPermissions = async () => {
    // Get permissions from roles data (they all have the same permissions available)
    if (roles.length > 0 && roles[0].rolePermissions.length > 0) {
      const allPermissions = new Map<string, Permission>()
      roles.forEach((role) => {
        role.rolePermissions.forEach((rp) => {
          if (!allPermissions.has(rp.permission.id)) {
            allPermissions.set(rp.permission.id, rp.permission)
          }
        })
      })
      setPermissions(Array.from(allPermissions.values()))
    } else {
      // If no roles, fetch from a role to get all permissions
      // For now, we'll get them from the first role's permissions
      // In a real app, you'd have a separate permissions endpoint
    }
  }

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

  const handleEditPermissions = (role: Role) => {
    setEditingRole(role)
    setSelectedPermissions(role.rolePermissions.map((rp) => rp.permission.id))
  }

  const handleSavePermissions = async () => {
    if (!editingRole) return

    try {
      const response = await fetch(
        `/api/roles/${editingRole.id}/permissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissionIds: selectedPermissions }),
        }
      )

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
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadRoles()
      }
    } catch (error) {
      console.error("Failed to delete role:", error)
    }
  }

  if (loading) {
    return <div className="text-gray-600">Loading roles...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Create Role
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {role.name}
                  </div>
                  {role.description && (
                    <div className="text-sm text-gray-500">
                      {role.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {role.rolePermissions.map((rp) => (
                      <span
                        key={rp.permission.id}
                        className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded"
                      >
                        {rp.permission.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditPermissions(role)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit Permissions
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Edit Permissions for {editingRole.name}
            </h3>
            <div className="space-y-2 mb-4">
              {permissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([
                          ...selectedPermissions,
                          permission.id,
                        ])
                      } else {
                        setSelectedPermissions(
                          selectedPermissions.filter(
                            (id) => id !== permission.id
                          )
                        )
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    {permission.name}
                    {permission.description && (
                      <span className="text-gray-500 ml-2">
                        - {permission.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingRole(null)
                  setSelectedPermissions([])
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Create New Role
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateRole}
                disabled={!newRoleName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewRoleName("")
                  setNewRoleDescription("")
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
