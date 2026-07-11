import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * JWT Authentication Middleware
 * Verifies the token from the Authorization header and attaches user to request
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Extract token from Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized — no token provided' });
      return;
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, secret) as { id: string };

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'Not authorized — user not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};
