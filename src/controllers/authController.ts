import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { db } from '../utils/db.js';
import asyncHandler from 'express-async-handler';

// @desc   Register a new user
// @route  POST /auth/register
// @access Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: 'Invalid input',
    });
    return;
  }

  try {
    const userExists = await db.user.findUnique({ where: { email } });

    if (userExists) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await db.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({
      userId: user.id,
      message: 'User registered successfully',
    });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// @desc   Log in a user and return token
// @route  POST /auth/login
// @access Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const generateToken = (id: string) =>
      jwt.sign({ id }, config.jwtSecret, { expiresIn: '30d' });

    res.status(200).json({
      userId: user.id,
      token: generateToken(user.id),
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});
