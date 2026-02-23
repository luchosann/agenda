import { z } from 'zod';

export const createBusinessSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().optional(),
  description: z.string().optional(),
});

export const updateBusinessSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});
