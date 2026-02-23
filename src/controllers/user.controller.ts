import type { Request, Response } from 'express';
import * as userServices from '../services/user.services';
import { createUserSchema, updateUserSchema } from '../schema/user.schema';
import { ZodError } from 'zod';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const createUser = async (req: Request, res: Response) => {
  const data = createUserSchema.parse(req.body);
  const user = await userServices.createUser(data);
  return res.status(201).json(user);
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userServices.getAllUsers();
  return res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
  const user = await userServices.getUserById(req.params.id);
  if (!user) throw new NotFoundError('Usuario no encontrado');
  return res.json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const data = updateUserSchema.parse(req.body);
  const user = await userServices.updateUser(req.params.id, data);
  return res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userServices.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { // Registro no encontrado (Prisma)
      throw new NotFoundError('Usuario no encontrado');
    }
    throw error; // Re-throw other errors
  }
};
