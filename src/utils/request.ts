import type { Request } from 'express';

export function param(req: Request, key: string): string {
  const value = req.params[key];
  if (typeof value !== 'string') {
    throw new Error(`Missing route param: ${key}`);
  }
  return value;
}
