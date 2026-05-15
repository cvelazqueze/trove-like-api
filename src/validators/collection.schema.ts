import { z } from 'zod';

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(200),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(200),
});

export const collectionIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const addProductSchema = z.object({
  productId: z.string().uuid(),
});

export const collectionProductParamSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
});
