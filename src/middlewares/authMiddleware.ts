import jwt from 'jsonwebtoken';
import config from '../config/config';
import { db } from '../utils/db';
import { Request, Response, NextFunction } from 'express';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      const user = await db.user.findUnique({ where: { id: decoded.id } });
      if (!user) return res.status(401).json({ message: 'User not found' });

      req.user = { id: user.id, email: user.email };
      next();
    } catch {
      return res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ message: 'No token' });
  }
};
