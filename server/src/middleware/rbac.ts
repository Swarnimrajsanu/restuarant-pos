import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Role-Based Access Control Middleware
 * Restricts access to routes based on user roles
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
      return;
    }

    next();
  };
};
