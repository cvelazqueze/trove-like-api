import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});
