import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(1).max(100).regex(/^[\w\sáéíóúñÁÉÍÓÚÑ'-]+$/i, 'Nombre inválido'),
    email: z.string().email("Email invalido"),
    password: z.string().min(8, "La contrasenia debe tener al menos 8 digitos"),
    role: z.enum(['OWNER', 'CLIENT', 'EMPLOYEE']).optional()
})

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;