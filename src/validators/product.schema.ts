import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive(),
  imageUrl: z.string().url().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().positive().optional(),
  imageUrl: z.string().url().optional().nullable(),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const trendingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
