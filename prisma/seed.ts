import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create permissions
  const permissions = [
    { name: 'tasks.create', description: 'Create tasks' },
    { name: 'tasks.read', description: 'Read tasks' },
    { name: 'tasks.update', description: 'Update tasks' },
    { name: 'tasks.delete', description: 'Delete tasks' },
    { name: 'tasks.assign', description: 'Assign tasks to users' },
    { name: 'comments.create', description: 'Create comments' },
    { name: 'comments.update', description: 'Update comments' },
    { name: 'comments.delete', description: 'Delete comments' },
    { name: 'users.manage', description: 'Manage users' },
    { name: 'roles.manage', description: 'Manage roles and permissions' },
  ]

  const createdPermissions = await Promise.all(
    permissions.map(p =>
      prisma.permission.upsert({
        where: { name: p.name },
        update: {},
        create: p,
      })
    )
  )

  console.log('Created permissions:', createdPermissions.length)

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Full access to all features',
      rolePermissions: {
        create: createdPermissions.map(p => ({
          permissionId: p.id,
        })),
      },
    },
    include: { rolePermissions: { include: { permission: true } } },
  })

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Can manage tasks and comments',
      rolePermissions: {
        create: [
          'tasks.create',
          'tasks.read',
          'tasks.update',
          'tasks.assign',
          'comments.create',
          'comments.update',
          'comments.delete',
        ].map(permName => ({
          permissionId: createdPermissions.find(p => p.name === permName)!.id,
        })),
      },
    },
    include: { rolePermissions: { include: { permission: true } } },
  })

  const developerRole = await prisma.role.upsert({
    where: { name: 'Developer' },
    update: {},
    create: {
      name: 'Developer',
      description: 'Can work on assigned tasks',
      rolePermissions: {
        create: [
          'tasks.read',
          'tasks.update',
          'comments.create',
          'comments.update',
          'comments.delete',
        ].map(permName => ({
          permissionId: createdPermissions.find(p => p.name === permName)!.id,
        })),
      },
    },
    include: { rolePermissions: { include: { permission: true } } },
  })

  const viewerRole = await prisma.role.upsert({
    where: { name: 'Viewer' },
    update: {},
    create: {
      name: 'Viewer',
      description: 'Read-only access',
      rolePermissions: {
        create: ['tasks.read'].map(permName => ({
          permissionId: createdPermissions.find(p => p.name === permName)!.id,
        })),
      },
    },
    include: { rolePermissions: { include: { permission: true } } },
  })

  console.log('Created roles: Admin, Manager, Developer, Viewer')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      userRoles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  })

  console.log('Created admin user: admin@example.com / admin123')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
