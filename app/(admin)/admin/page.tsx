"use client"

import Link from "next/link"
import { useSessionWithPermissions } from "@/lib/use-session"

export default function AdminPage() {
  const { data: session } = useSessionWithPermissions()
  const canManageUsers = session?.user?.permissions?.includes("users.manage")
  const canManageRoles = session?.user?.permissions?.includes("roles.manage")

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Back to Board
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Administration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {canManageUsers && (
              <Link
                href="/admin/users"
                className="block p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 transition-colors"
              >
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                  User Management
                </h3>
                <p className="text-indigo-700">
                  Manage users, assign roles, and edit user information
                </p>
              </Link>
            )}

            {canManageRoles && (
              <Link
                href="/admin/roles"
                className="block p-6 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors"
              >
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Role Management
                </h3>
                <p className="text-green-700">
                  Create and manage roles, assign permissions to roles
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
