import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { verifyToken } from '../utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or invalid authorization header'));
  }

  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}
