import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import * as XLSX from 'xlsx';

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
