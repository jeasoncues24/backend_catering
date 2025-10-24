import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRoles() {
  const roles = [
    {
      name: 'SUPER_ADMIN',
      status: 1,
    },
    {
      name: 'ADMIN',
      status: 1,
    },
    {
      name: 'MANAGER',
      status: 1,
    },
    {
      name: 'COLLABORATOR',
      status: 1,
    },
    {
      name: 'CLIENT',
      status: 1,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('Roles seeded successfully');
} 