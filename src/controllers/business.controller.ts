import type { Request, Response } from 'express';
import * as businessServices from '../services/business.services';
import { createBusinessSchema, updateBusinessSchema } from '../schema/business.schema';
import { ZodError } from 'zod';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

// Este controlador es para el enrutador de la API (api.midominio.com)
export const createBusiness = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = createBusinessSchema.parse(req.body);
  const business = await businessServices.createBusiness(data, userId);
  return res.status(201).json(business);
};

// Este controlador es para el enrutador de la API (api.midominio.com)
export const getAllBusinesses = async (_req: Request, res: Response) => {
  const businesses = await businessServices.getAllBusinesses();
  return res.json(businesses);
};

// Este controlador se usa en el subdominio de la empresa (mi-empresa.midominio.com)
export const getBusiness = async (req: Request, res: Response) => {
  // El middleware de subdominios ya ha encontrado la empresa y la ha adjuntado a la solicitud.
  // Simplemente la devolvemos.
  const business = (req as any).business;
  return res.json(business);
};

export const updateBusiness = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const business = (req as any).business;

  // La comprobación de NotFoundError ya no es necesaria aquí, el middleware se encarga.

  if (business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para actualizar esta empresa');
  }

  const data = updateBusinessSchema.parse(req.body);
  const updatedBusiness = await businessServices.updateBusiness(business.id, data);
  return res.json(updatedBusiness);
};

export const deleteBusiness = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const business = (req as any).business;

  // La comprobación de NotFoundError ya no es necesaria aquí, el middleware se encarga.

  if (business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para eliminar esta empresa');
  }

  try {
    await businessServices.deleteBusiness(business.id);
    return res.status(204).send();
  } catch (error: any) {
    // El error P2025 (Registro no encontrado) es menos probable aquí, pero se mantiene por seguridad.
    if (error.code === 'P2025') {
      throw new NotFoundError('Empresa no encontrada');
    }
    throw error; // Re-throw other errors
  }
};
