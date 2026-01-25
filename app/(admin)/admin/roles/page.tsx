"use client"

import Link from "next/link"
import { RoleManagement } from "@/components/admin/RoleManagement"

export default function AdminRolesPage() {
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
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            ← Back to Admin
          </Link>
        </div>
        <RoleManagement />
      </div>
    </div>
  )
}
