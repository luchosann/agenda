import prisma from "../prisma/client";
import type { CreateUserInput } from "../models/user.model";
import bcrypt from 'bcryptjs';

// Crear Usuario 
export async function createUser(data: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({ 
        data: {
            ...data,
            password: hashedPassword,
            role: 'CLIENT' // Siempre se crea como CLIENT
        }, 
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
     });
}

// Borrar usuario
export async function deleteUser(id: string) {
    return prisma.user.delete({ 
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
    });
}

// Obtener todos los usuarios
export async function getAllUsers() {
    const allUsersFormat = prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
    }); 
    return allUsersFormat
}

// Obtener un usuario por id
export async function getUserById(id: string) {
    return prisma.user.findUnique({ 
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            businessId: true,
        }
    });
}

// Obtener un usuario por email
export async function getUserByEmail(email: string) {
    return prisma.user.findUnique({ 
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }     
    });
}

// Actualizar usuario
export async function updateUser(id: string, data: Partial<CreateUserInput>) {
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.user.update({
        where: { id }, 
        data, 
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
    });
}