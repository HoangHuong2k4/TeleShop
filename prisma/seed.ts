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
      name: 'ChatGPT Plus',
      price: 500000,
      description: 'Tài khoản ChatGPT Plus cá nhân chính chủ.',
    },
    {
      name: 'ChatGPT Business',
      price: 1200000,
      description: 'Tài khoản ChatGPT Business ổn định, không giới hạn.',
    },
    {
      name: 'Microsoft 365 (1 Năm)',
      price: 250000,
      description: 'Bản quyền Microsoft 365 chính hãng thời hạn 1 năm.',
    },
    {
      name: 'Microsoft 365 (5 Năm)',
      price: 950000,
      description: 'Bản quyền Microsoft 365 chính hãng thời hạn 5 năm.',
    },
  ];

  // Clear existing inventory and products for this bot to avoid duplicates/constraints
  await prisma.productAccount.deleteMany({
    where: { product: { botId: bot.id } },
  });
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

  // 4. Create Product Accounts (Inventory)
  const allProducts = await prisma.product.findMany();
  for (const product of allProducts) {
    // Clear existing accounts for these products first
    await prisma.productAccount.deleteMany({ where: { productId: product.id } });
    
    await prisma.productAccount.createMany({
      data: [
        { productId: product.id, content: `acc1_${product.name.toLowerCase().replace(/\s+/g, '_')}@example.com:pass123` },
        { productId: product.id, content: `acc2_${product.name.toLowerCase().replace(/\s+/g, '_')}@example.com:pass456` },
        { productId: product.id, content: `LICENSE-KEY-${product.name.toUpperCase().replace(/\s+/g, '-')}-789-XYZ`, isSold: false },
      ],
    });
  }
  console.log('Seed product accounts created successfully');

  // 5. Create Demo Bot Users (Customers)
  const allBots = await prisma.botConfig.findMany();
  for (const botConfig of allBots) {
    await prisma.botUser.upsert({
      where: { teleId_botId: { teleId: '987654321', botId: botConfig.id } },
      update: {},
      create: {
        teleId: '987654321',
        username: 'customer_demo',
        firstName: 'Khách',
        lastName: 'Demo',
        balance: 150000,
        botId: botConfig.id,
      },
    });
  }
  console.log('Seed bot users created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
