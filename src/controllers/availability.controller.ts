import type { Request, Response } from 'express';
import * as availabilityServices from '../services/availability.services';
import { z } from 'zod';
import { BadRequestError } from '../utils/errors';

const availabilityQuerySchema = z.object({
  serviceId: z.string().uuid('El ID de servicio debe ser un UUID válido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD'),
});

export const getAvailability = async (req: Request, res: Response) => {
  const query = availabilityQuerySchema.parse(req.query);
  const availability = await availabilityServices.getAvailability(query.serviceId, query.date);
  return res.json(availability);
};
