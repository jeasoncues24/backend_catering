import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCompanyTypes() {
  const types = [
    {
      name: 'CATERING ALL',
      status: 1,
    },
  ];

  for (const type of types) {
    await prisma.typeCompany.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  console.log('Company types seeded successfully');
} 