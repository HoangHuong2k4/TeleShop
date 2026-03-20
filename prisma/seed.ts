import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Demo User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@teleshop.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@teleshop.com',
      password: hashedPassword,
      plan: 'PRO',
    },
  });

  console.log('User created:', user.email);

  // 2. Create Demo Bot Config
  const bot = await prisma.botConfig.upsert({
    where: { botToken: '123456789:ABCDEF_DEMO_TOKEN' },
    update: {},
    create: {
      userId: user.id,
      botToken: '123456789:ABCDEF_DEMO_TOKEN',
      botUsername: 'TeleShopDemoBot',
      bankName: 'MB Bank',
      bankAccount: '999999999',
      bankOwner: 'HUONG MMO',
    },
  });

  console.log('Bot created:', bot.botUsername);

  // 3. Create Products
  const products = [
    {
      name: 'ChatGPT Plus Business Pro',
      price: 500000,
      description: 'Tài khoản ChatGPT Plus phiên bản Business Pro, ổn định, không giới hạn.',
    },
    {
      name: 'Microsoft 365 (1 Năm)',
      price: 250000,
      description: 'Bản quyền Microsoft 365 chính hãng thời hạn 1 năm.',
    },
    {
      name: 'Microsoft 365 (5 Năm)',
      price: 950000,
      description: 'Bản quyền Microsoft 365 chính hãng thời hạn 5 năm, tiết kiệm hơn.',
    },
  ];

  // Clear existing products for this bot to avoid duplicates
  await prisma.product.deleteMany({
    where: { botId: bot.id },
  });

  for (const p of products) {
    await prisma.product.create({
      data: {
        ...p,
        botId: bot.id,
      },
    });
  }

  console.log('Seed products created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
