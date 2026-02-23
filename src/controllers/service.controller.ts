import type { Request, Response } from 'express';
import * as serviceServices from '../services/service.services';
import { createServiceSchema, updateServiceSchema } from '../schema/service.schema';
import { NotFoundError, ForbiddenError } from '../utils/errors';

// Extender Request para incluir la propiedad business
interface CustomRequest extends Request {
  business?: { id: string; ownerId: string; };
}

export const createService = async (req: CustomRequest, res: Response) => {
  const userId = (req as any).user.id;
  const business = req.business!;

  if (business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para crear un servicio en esta empresa');
  }

  const data = createServiceSchema.parse(req.body);
  const service = await serviceServices.createService(business.id, data);
  return res.status(201).json(service);
};

export const getServicesByBusiness = async (req: CustomRequest, res: Response) => {
  const business = req.business!;
  const services = await serviceServices.getServicesByBusiness(business.id);
  return res.json(services);
};

export const getService = async (req: Request, res: Response) => {
  const service = await serviceServices.getServiceById(req.params.serviceId);
  if (!service) throw new NotFoundError('Servicio no encontrado');
  return res.json(service);
};

export const updateService = async (req: CustomRequest, res: Response) => {
  const userId = (req as any).user.id;
  const business = req.business!;
  const { serviceId } = req.params;
  const service = await serviceServices.getServiceById(serviceId);

  if (!service) {
    throw new NotFoundError('Servicio no encontrado');
  }

  // Validar que el servicio pertenece a la empresa del subdominio y que el usuario es el propietario
  if (service.businessId !== business.id || business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para actualizar este servicio');
  }

  const data = updateServiceSchema.parse(req.body);
  const updatedService = await serviceServices.updateService(serviceId, data);
  return res.json(updatedService);
};

export const deleteService = async (req: CustomRequest, res: Response) => {
  const userId = (req as any).user.id;
  const business = req.business!;
  const { serviceId } = req.params;
  const service = await serviceServices.getServiceById(serviceId);

  if (!service) {
    throw new NotFoundError('Servicio no encontrado');
  }

  // Validar que el servicio pertenece a la empresa del subdominio y que el usuario es el propietario
  if (service.businessId !== business.id || business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para eliminar este servicio');
  }

  try {
    await serviceServices.deleteService(serviceId);
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Servicio no encontrado');
    }
    throw error; // Re-throw other errors
  }
};
