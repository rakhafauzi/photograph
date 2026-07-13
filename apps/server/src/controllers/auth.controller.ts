import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma/client';
import { config } from '../config';
import { sendSuccess, sendError } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';
import { JwtPayload } from '../middlewares/auth';
import dayjs from 'dayjs';

// Validation Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// Generate Tokens
const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      id: generateId(),
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer',
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokens(payload);

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      id: generateId(),
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: dayjs().add(7, 'day').toDate(),
    },
  });

  sendSuccess(res, { user, ...tokens }, 'Registration successful', 201);
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokens(payload);

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      id: generateId(),
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: dayjs().add(7, 'day').toDate(),
    },
  });

  sendSuccess(res, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    ...tokens,
  }, 'Login successful');
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required', 400);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    if (storedToken) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    }
    throw new AppError('Invalid or expired refresh token', 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    const payload: JwtPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    const tokens = generateTokens(payload);

    // Delete old refresh token and create new one
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    await prisma.refreshToken.create({
      data: {
        id: generateId(),
        token: tokens.refreshToken,
        userId: storedToken.user.id,
        expiresAt: dayjs().add(7, 'day').toDate(),
      },
    });

    sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError('Invalid refresh token', 401);
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;

  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  sendSuccess(res, null, 'Logged out successfully');
};

// Get Current User
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendSuccess(res, user);
};
