import type { Request, Response } from 'express';
import * as employeeServices from '../services/employee.services';
import * as userServices from '../services/user.services';
import { NotFoundError, ForbiddenError } from '../utils/errors';

// Extender Request para incluir la propiedad business
interface CustomRequest extends Request {
  business?: { id: string; ownerId: string; };
}

export const addEmployee = async (req: CustomRequest, res: Response) => {
  const userId = (req as any).user.id;
  const business = req.business!;

  if (business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para añadir empleados a esta empresa.');
  }

  const { email } = req.body;
  const user = await userServices.getUserByEmail(email);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado para añadir como empleado.');
  }

  const employee = await employeeServices.addEmployeeToBusiness(business.id, user.id);
  return res.status(201).json(employee);
};

export const removeEmployee = async (req: CustomRequest, res: Response) => {
  const userId = (req as any).user.id;
  const { employeeId } = req.params;
  const business = req.business!;

  if (business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para eliminar empleados de esta empresa.');
  }

  try {
    await employeeServices.removeEmployeeFromBusiness(employeeId);
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error for record not found
      throw new NotFoundError('Empleado no encontrado en esta empresa.');
    }
    throw error;
  }
};

export const getEmployees = async (req: CustomRequest, res: Response) => {
  const business = req.business!;
  const employees = await employeeServices.getEmployeesByBusiness(business.id);
  return res.json(employees);
};

export const assignService = async (req: CustomRequest, res: Response) => {
  const userId = (req as any).user.id;
  const { employeeId } = req.params;
  const business = req.business!;

  if (business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para asignar servicios.');
  }

  const { serviceId } = req.body;
  const assignment = await employeeServices.assignServiceToEmployee({ employeeId, serviceId });
  return res.status(201).json(assignment);
};

export const removeService = async (req: CustomRequest, res: Response) => {
  const userId = (req as any).user.id;
  const { employeeId, serviceId } = req.params;
  const business = req.business!;

  if (business.ownerId !== userId) {
    throw new ForbiddenError('No tienes permiso para quitar servicios.');
  }

  try {
    await employeeServices.removeServiceFromEmployee(employeeId, serviceId);
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error for record not found
      throw new NotFoundError('Asignación de servicio no encontrada.');
    }
    throw error;
  }
};

export const getEmployeeServices = async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const services = await employeeServices.getServicesByEmployee(employeeId);
  return res.json(services);
};
