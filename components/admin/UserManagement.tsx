"use client"

import { useEffect, useState } from "react"

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
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  if (loading) {
    return <div className="text-gray-600">Loading users...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name || user.email}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.userRoles.map((ur) => (
                      <span
                        key={ur.role.id}
                        className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded"
                      >
                        {ur.role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditRoles(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit Roles
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
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

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Edit Roles for {editingUser.name || editingUser.email}
            </h3>
            <div className="space-y-2 mb-4">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, role.id])
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter((id) => id !== role.id)
                        )
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    {role.name}
                    {role.description && (
                      <span className="text-gray-500 ml-2">
                        - {role.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveRoles}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingUser(null)
                  setSelectedRoles([])
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
