import { z } from 'zod';

export const createWorkScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6, 'El día de la semana debe estar entre 0 (Domingo) and 6 (Sábado)'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El formato de hora de inicio debe ser HH:mm'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El formato de hora de fin debe ser HH:mm'),
});

export const updateWorkScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6, 'El día de la semana debe estar entre 0 (Domingo) and 6 (Sábado)').optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El formato de hora de inicio debe ser HH:mm').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El formato de hora de fin debe ser HH:mm').optional(),
});
