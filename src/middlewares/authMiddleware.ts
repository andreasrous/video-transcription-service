import jwt from 'jsonwebtoken';
import config from '../config/config';
import { db } from '../utils/db';
import { Request, Response, NextFunction } from 'express';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await db.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized' });
  }
};
