import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  duration: z.number().int().positive('La duración debe ser un número positivo'),
  price: z.number().positive('El precio debe ser un número positivo'),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  description: z.string().optional(),
  duration: z.number().int().positive('La duración debe ser un número positivo').optional(),
  price: z.number().positive('El precio debe ser un número positivo').optional(),
});
