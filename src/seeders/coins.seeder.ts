import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCoins() {
  const coins = [
    {
      name: 'Dólar Estadounidense',
      symbol: 'USD',
    },
    {
      name: 'Euro',
      symbol: 'EUR',
    },
    {
      name: 'Libra Esterlina',
      symbol: 'GBP',
    },
    {
      name: 'Peso Mexicano',
      symbol: 'MXN',
    },
    {
      name: 'Sol Peruano',
      symbol: 'PEN',
    },
    {
      name: 'Peso Colombiano',
      symbol: 'COP',
    },
    {
      name: 'Peso Chileno',
      symbol: 'CLP',
    },
    {
      name: 'Peso Argentino',
      symbol: 'ARS',
    },
  ];

  for (const coin of coins) {
    await prisma.coins.upsert({
      where: { symbol: coin.symbol },
      update: {},
      create: coin,
    });
  }

  console.log('Coins seeded successfully');
} 