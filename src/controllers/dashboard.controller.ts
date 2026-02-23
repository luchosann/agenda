import type { Request, Response } from 'express';
import * as dashboardServices from '../services/dashboard.services';
import { ForbiddenError } from '../utils/errors';

// Extender Request para incluir la propiedad business
interface CustomRequest extends Request {
  business?: { id: string; ownerId: string; };
}

export const getDashboardData = async (req: CustomRequest, res: Response) => {
  const userId = (req as any).user.id;
  const business = req.business!;

  if (business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para ver este dashboard');
  }

  const dashboardData = await dashboardServices.getDashboardData(business.id);
  return res.json(dashboardData);
};
