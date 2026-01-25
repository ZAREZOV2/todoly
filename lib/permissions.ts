import { UserWithRoles } from './types'

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

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: UserWithRoles): Permission[] {
  const permissions = new Set<Permission>()
  
  for (const userRole of user.userRoles) {
    for (const rolePermission of userRole.role.rolePermissions) {
      permissions.add(rolePermission.permission.name as Permission)
    }
  }
  
  return Array.from(permissions)
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserWithRoles | null, permission: Permission): boolean {
  if (!user) return false
  const permissions = getUserPermissions(user)
  return permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: UserWithRoles | null, ...permissions: Permission[]): boolean {
  if (!user) return false
  const userPermissions = getUserPermissions(user)
  return permissions.some(perm => userPermissions.includes(perm))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: UserWithRoles | null, ...permissions: Permission[]): boolean {
  if (!user) return false
  const userPermissions = getUserPermissions(user)
  return permissions.every(perm => userPermissions.includes(perm))
}
