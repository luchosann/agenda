import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { authLogin } from '../services/auth.services';
import { BadRequestError } from '../utils/errors';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await authLogin(email, password);
  if (!user) {
    throw new BadRequestError('Credenciales inválidas');
  }

  const token = generateToken({ id: user.id, email: user.email });

  // Determina qué negocio enviar en la respuesta
  const business = user.ownedBusiness || user.business;

  // Excluimos la contraseña y otros datos sensibles de la respuesta
  const { password: _p, ownedBusiness, business: _b, ...userResponse } = user;

  return res.json({
    token,
    user: userResponse,
    business: business || null // Devuelve el negocio o null si no pertenece a ninguno
  });
};
