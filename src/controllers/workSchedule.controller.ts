import type { Request, Response } from 'express';
import * as workScheduleServices from '../services/workSchedule.services';
import * as userServices from '../services/user.services';
import { createWorkScheduleSchema, updateWorkScheduleSchema } from '../schema/workSchedule.schema';
import { NotFoundError, ForbiddenError } from '../utils/errors';

// Extender Request para incluir la propiedad business
interface CustomRequest extends Request {
  business?: { id: string; ownerId: string; };
}

// Helper para verificar la pertenencia del empleado al negocio
const checkEmployeeBelongsToBusiness = async (employeeId: string, businessId: string) => {
  const employee = await userServices.getUserById(employeeId);
  if (!employee || employee.businessId !== businessId) {
    throw new ForbiddenError('Este empleado no pertenece a la empresa actual.');
  }
  return employee;
};

export const createWorkSchedule = async (req: CustomRequest, res: Response) => {
  const loggedInUserId = (req as any).user.id;
  const { employeeId } = req.params;
  const business = req.business!;

  await checkEmployeeBelongsToBusiness(employeeId, business.id);

  if (loggedInUserId !== employeeId) {
    throw new ForbiddenError('No tienes permiso para crear un horario para este empleado');
  }

  const data = createWorkScheduleSchema.parse(req.body);
  const workSchedule = await workScheduleServices.createWorkSchedule({ ...data, employeeId });
  return res.status(201).json(workSchedule);
};

export const getWorkSchedulesByEmployee = async (req: CustomRequest, res: Response) => {
  const loggedInUserId = (req as any).user.id;
  const { employeeId } = req.params;
  const business = req.business!;

  await checkEmployeeBelongsToBusiness(employeeId, business.id);

  // Permite si el que consulta es el propio empleado o el dueño del negocio
  if (loggedInUserId !== employeeId && loggedInUserId !== business.ownerId) {
    throw new ForbiddenError('No tienes permiso para ver estos horarios');
  }

  const workSchedules = await workScheduleServices.getWorkSchedulesByEmployee(employeeId);
  return res.json(workSchedules);
};

export const getWorkSchedule = async (req: CustomRequest, res: Response) => {
  const loggedInUserId = (req as any).user.id;
  const { employeeId, scheduleId } = req.params;
  const business = req.business!;

  await checkEmployeeBelongsToBusiness(employeeId, business.id);

  const workSchedule = await workScheduleServices.getWorkScheduleById(scheduleId);
  if (!workSchedule || workSchedule.employeeId !== employeeId) {
    throw new NotFoundError('Horario de trabajo no encontrado para este empleado.');
  }

  if (loggedInUserId !== employeeId && loggedInUserId !== business.ownerId) {
    throw new ForbiddenError('No tienes permiso para ver este horario');
  }

  return res.json(workSchedule);
};

export const updateWorkSchedule = async (req: CustomRequest, res: Response) => {
  const loggedInUserId = (req as any).user.id;
  const { employeeId, scheduleId } = req.params;
  const business = req.business!;

  await checkEmployeeBelongsToBusiness(employeeId, business.id);

  const schedule = await workScheduleServices.getWorkScheduleById(scheduleId);
  if (!schedule || schedule.employeeId !== employeeId) {
    throw new NotFoundError('Horario no encontrado para este empleado');
  }

  if (schedule.employeeId !== loggedInUserId) {
    throw new ForbiddenError('No tienes permiso para actualizar este horario');
  }

  const data = updateWorkScheduleSchema.parse(req.body);
  const workSchedule = await workScheduleServices.updateWorkSchedule(scheduleId, data);
  return res.json(workSchedule);
};

export const deleteWorkSchedule = async (req: CustomRequest, res: Response) => {
  const loggedInUserId = (req as any).user.id;
  const { employeeId, scheduleId } = req.params;
  const business = req.business!;

  await checkEmployeeBelongsToBusiness(employeeId, business.id);

  const schedule = await workScheduleServices.getWorkScheduleById(scheduleId);
  if (!schedule || schedule.employeeId !== employeeId) {
    throw new NotFoundError('Horario no encontrado para este empleado');
  }

  if (schedule.employeeId !== loggedInUserId) {
    throw new ForbiddenError('No tienes permiso para eliminar este horario');
  }

  try {
    await workScheduleServices.deleteWorkSchedule(scheduleId);
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Horario de trabajo no encontrado');
    }
    throw error;
  }
};
