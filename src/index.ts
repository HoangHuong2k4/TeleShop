import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Bot, webhookCallback } from 'grammy';
import prisma from './lib/prisma';

interface Product {
  id: number;
  botId: number;
  name: string;
  price: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
import * as authController from './controllers/authController';
import * as adminController from './controllers/adminController';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Public routes
app.get('/', (req, res) => {
  res.send('TeleShop SaaS API is running');
});

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Admin routes (Protected)
app.get('/api/admin/bots', authMiddleware as any, adminController.getBots as any);
app.post('/api/admin/bots', authMiddleware as any, adminController.createBot as any);
app.get('/api/admin/products/:botId', authMiddleware as any, adminController.getProducts as any);
app.post('/api/admin/products', authMiddleware as any, adminController.createProduct as any);

/**
 * Webhook endpoint for all bots
 * Telegram will send updates to /webhook/:token
 */
app.post('/webhook/:token', async (req, res) => {
  const { token } = req.params;
  
  // 1. Find bot in database
  const botConfig = await prisma.botConfig.findUnique({
    where: { botToken: token },
    include: {
      products: true
    }
  });

  if (!botConfig || !botConfig.isActive) {
    return res.status(404).send('Bot not found or inactive');
  }

  // 2. Instantiate Grammy Bot
  const bot = new Bot(token);

  // 3. Define Bot Logic
  bot.command('start', async (ctx) => {
    await ctx.reply('Chào mừng bạn đến với TeleShop! Sử dụng /menu để xem danh sách sản phẩm.');
  });

  bot.command('menu', async (ctx) => {
    const products = botConfig.products;
    if (products.length === 0) {
      return await ctx.reply('Hiện chưa có sản phẩm nào.');
    }

    const menuMessage = products.map((p: Product) => `${p.name} - ${p.price} VND\n${p.description || ''}`).join('\n\n');
    await ctx.reply(`Danh mục sản phẩm:\n\n${menuMessage}`);
  });

  bot.catch((err) => {
    console.error(`Error for bot ${token}:`, err);
  });

  return webhookCallback(bot, 'express')(req, res);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
