import type { Request, Response, NextFunction } from 'express';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { AppError } from '../errors/AppError';
import { logger } from '../lib/logger';
import { config } from '../config';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: {
        message: 'Resource already exists',
        code: 'DUPLICATE_ENTRY',
      },
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: {
        message: err.message,
        code: 'VALIDATION_ERROR',
      },
    });
  }

  logger.error({ err }, 'Unhandled error');

  return res.status(500).json({
    error: {
      message: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
      code: 'INTERNAL_ERROR',
    },
  });
}
