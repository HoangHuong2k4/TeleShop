import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import * as XLSX from 'xlsx';

// Dashboard Stats
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const userId = req.user?.id;

    if (isAdmin) {
      // Global Stats for Super Admin
      const totalUsers = await prisma.user.count();
      const totalBots = await prisma.botConfig.count({ where: { isActive: true } });
      
      const paidOrders = await prisma.order.findMany({
        where: { status: 'PAID' },
        select: { totalAmount: true }
      });
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalInventory = await prisma.productAccount.count({ where: { isSold: false } });

      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          bot: { select: { botUsername: true } }
        }
      });

      return res.json({
        totalUsers,
        totalBots,
        totalRevenue,
        totalInventory,
        recentOrders
      });
    } else {
      // Targeted Stats for regular User
      const myBots = await prisma.botConfig.findMany({ where: { userId } });
      const botIds = myBots.map(b => b.id);

      const totalBots = myBots.length;
      const totalProducts = await prisma.product.count({ where: { botId: { in: botIds } } });
      
      const paidOrders = await prisma.order.findMany({
        where: { botId: { in: botIds }, status: 'PAID' },
        select: { totalAmount: true }
      });
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      const totalInventory = await prisma.productAccount.count({ 
        where: { product: { botId: { in: botIds } }, isSold: false } 
      });

      const recentOrders = await prisma.order.findMany({
        where: { botId: { in: botIds } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          bot: { select: { botUsername: true } }
        }
      });

      return res.json({
        totalUsers: 0, // Not applicable for regular user
        totalBots,
        totalProducts,
        totalRevenue,
        totalInventory,
        recentOrders
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// Bot Management
export const getBots = async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user?.role === 'ADMIN';
  const targetUserId = req.query.userId ? Number(req.query.userId) : null;
  
  const userId = (isAdmin && targetUserId) ? targetUserId : req.user?.id;
  
  const bots = await prisma.botConfig.findMany({ where: { userId } });
  res.json(bots);
};

export const createBot = async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user?.role === 'ADMIN';
  const { botToken, botUsername, bankName, bankAccount, bankOwner, sepayApiKey, userId: targetUserId } = req.body;
  const userId = (isAdmin && targetUserId) ? Number(targetUserId) : req.user?.id;

  try {
    const bot = await prisma.botConfig.create({
      data: {
        userId: userId!,
        botToken,
        botUsername,
        bankName,
        bankAccount,
        bankOwner,
        sepayApiKey,
      },
    });
    res.status(201).json(bot);
  } catch (error) {
    res.status(400).json({ message: 'Error creating bot' });
  }
};

export const updateBot = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { botToken, botUsername, bankName, bankAccount, bankOwner, sepayApiKey, isActive } = req.body;

  try {
    const bot = await prisma.botConfig.update({
      where: { id: Number(id) },
      data: {
        botToken,
        botUsername,
        bankName,
        bankAccount,
        bankOwner,
        sepayApiKey,
        isActive,
      },
    });
    res.json(bot);
  } catch (error) {
    res.status(400).json({ message: 'Error updating bot' });
  }
};

// Product Management
export const getProducts = async (req: AuthRequest, res: Response) => {
  const { botId } = req.params;
  const products = await prisma.product.findMany({ 
    where: { botId: Number(botId) },
    include: {
      _count: {
        select: { accounts: { where: { isSold: false } } }
      }
    }
  });
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

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        price: price ? Number(price) : undefined,
        description,
      },
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.productAccount.deleteMany({ where: { productId: Number(id) } });
    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: 'Product and associated accounts deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product' });
  }
};

// Account (Inventory) Management
export const getAccounts = async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const accounts = await prisma.productAccount.findMany({ 
    where: { productId: Number(productId) },
    orderBy: { createdAt: 'desc' }
  });
  res.json(accounts);
};

export const createAccount = async (req: AuthRequest, res: Response) => {
  const { productId, content } = req.body;

  try {
    const account = await prisma.productAccount.create({
      data: {
        productId: Number(productId),
        content,
      },
    });
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: 'Error creating account' });
  }
};

export const updateAccount = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { content, isSold } = req.body;

  try {
    const account = await prisma.productAccount.update({
      where: { id: Number(id) },
      data: {
        content,
        isSold,
      },
    });
    res.json(account);
  } catch (error) {
    res.status(400).json({ message: 'Error updating account' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.productAccount.delete({ where: { id: Number(id) } });
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting account' });
  }
};

// Excel Import
export const importAccounts = async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Please upload an Excel file' });
  }

  try {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];

    const accountsData = data.map(row => ({
      productId: Number(productId),
      content: String(row.content || row.Content || Object.values(row)[0]),
    }));

    if (accountsData.length === 0) {
      return res.status(400).json({ message: 'No data found in Excel file' });
    }

    await prisma.productAccount.createMany({
      data: accountsData,
    });

    res.json({ message: `Successfully imported ${accountsData.length} accounts` });
  } catch (error) {
    console.error('Import error:', error);
    res.status(400).json({ message: 'Error importing Excel file' });
  }
};

// User Management
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        plan: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { bots: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    } as any);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role, plan, isActive } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        role: role as any,
        plan,
        isActive,
      } as any,
      select: {
        id: true,
        email: true,
        role: true,
        plan: true,
        isActive: true,
      } as any
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    // Optional: Add logic to prevent deleting yourself or the last admin
    if (req.user?.id === Number(id)) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting user' });
  }
};
