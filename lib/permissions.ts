export type Permission =
  | 'tasks.create'
  | 'tasks.read'
  | 'tasks.update'
  | 'tasks.delete'
  | 'tasks.assign'
  | 'comments.create'
  | 'comments.update'
  | 'comments.delete'
  | 'users.manage'
  | 'roles.manage'

type SimpleUser = {
  role?: string | null
}

function getPermissionsForRole(role: string | null | undefined): Permission[] {
  // Basic mapping from simple string role to permissions.
  // Adjust as needed for your app.
  switch (role) {
    case 'ADMIN':
      return [
        'tasks.create',
        'tasks.read',
        'tasks.update',
        'tasks.delete',
        'tasks.assign',
        'comments.create',
        'comments.update',
        'comments.delete',
        'users.manage',
        'roles.manage',
      ]
    case 'MANAGER':
      return [
        'tasks.create',
        'tasks.read',
        'tasks.update',
        'tasks.assign',
        'comments.create',
        'comments.update',
        'comments.delete',
      ]
    case 'USER':
    default:
      return [
        'tasks.create',
        'tasks.read',
        'tasks.update',
        'comments.create',
        'comments.update',
      ]
  }
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: SimpleUser | null | undefined): Permission[] {
  if (!user) return []
  return getPermissionsForRole(user.role ?? 'USER')
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: SimpleUser | null, permission: Permission): boolean {
  if (!user) return false
  const permissions = getUserPermissions(user)
  return permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: SimpleUser | null, ...permissions: Permission[]): boolean {
  if (!user) return false
  const userPermissions = getUserPermissions(user)
  return permissions.some(perm => userPermissions.includes(perm))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: SimpleUser | null, ...permissions: Permission[]): boolean {
  if (!user) return false
  const userPermissions = getUserPermissions(user)
  return permissions.every(perm => userPermissions.includes(perm))
}
