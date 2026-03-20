import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

// Bot Management
export const getBots = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const bots = await prisma.botConfig.findMany({ where: { userId } });
  res.json(bots);
};

export const createBot = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { botToken, botUsername, bankName, bankAccount, bankOwner } = req.body;

  try {
    const bot = await prisma.botConfig.create({
      data: {
        userId: userId!,
        botToken,
        botUsername,
        bankName,
        bankAccount,
        bankOwner,
      },
    });
    res.status(201).json(bot);
  } catch (error) {
    res.status(400).json({ message: 'Error creating bot' });
  }
};

// Product Management
export const getProducts = async (req: AuthRequest, res: Response) => {
  const { botId } = req.params;
  const products = await prisma.product.findMany({ where: { botId: Number(botId) } });
  res.json(products);
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { botId, name, price, description } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        botId: Number(botId),
        name,
        price: Number(price),
        description,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product' });
  }
};
