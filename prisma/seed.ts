import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Admin and User accounts
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@teleshop.com' },
    update: { password: hashedPassword, role: 'ADMIN', plan: 'PRO' },
    create: { email: 'admin@teleshop.com', password: hashedPassword, role: 'ADMIN', plan: 'PRO' },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@teleshop.com' },
    update: { password: hashedPassword, role: 'USER', plan: 'BASIC' },
    create: { email: 'user@teleshop.com', password: hashedPassword, role: 'USER', plan: 'BASIC' },
  });

  console.log('Seed users created: admin@teleshop.com, user@teleshop.com');

  // Clear all previous transactional data to start fresh
  await prisma.order.deleteMany({});
  await prisma.productAccount.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.botUser.deleteMany({});
  await prisma.botConfig.deleteMany({});

  // 2. Create Resources for both
  const usersToSeed = [
    { u: admin, botName: 'AdminSuperBot', token: 'ADMIN_BOT_TOKEN' },
    { u: normalUser, botName: 'UserShopBot', token: 'USER_BOT_TOKEN' }
  ];

  for (const item of usersToSeed) {
    const bot = await prisma.botConfig.create({
      data: {
        userId: item.u.id,
        botToken: item.token,
        botUsername: item.botName,
        bankName: 'MB Bank',
        bankAccount: '123456789',
        bankOwner: item.u.email,
        sepayApiKey: `SP_${item.u.id}_KEY`
      }
    });

    const products = [
      { name: 'Gói Premium', price: 100000, desc: 'Dịch vụ cao cấp' },
      { name: 'Gói Thử Nghiệm', price: 10000, desc: 'Dịch vụ test' }
    ];

    for (const p of products) {
      const product = await prisma.product.create({
        data: {
          botId: bot.id,
          name: p.name,
          price: p.price,
          description: p.desc
        }
      });

      // Seeding 5 accounts per product
      await prisma.productAccount.createMany({
        data: Array.from({ length: 5 }).map((_, i) => ({
          productId: product.id,
          content: `${product.name.toLowerCase()}_acc_${i+1}@teleshop.com:pass123`
        }))
      });
    }

    // Seed some orders for dashboard visibility
    await prisma.order.create({
      data: {
        botId: bot.id,
        customerTeleId: '88888888',
        totalAmount: 200000,
        status: 'PAID' as any,
        paymentCode: `INV-${item.u.id}-001`,
      }
    });

    await prisma.order.create({
      data: {
        botId: bot.id,
        customerTeleId: '99999999',
        totalAmount: 10000,
        status: 'PENDING' as any,
        paymentCode: `INV-${item.u.id}-002`,
      }
    });
  }

  console.log('Seed resources and orders created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
