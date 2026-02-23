import bcrypt from 'bcrypt'
import prisma from '../prisma/client';
// import { Prisma } from '@prisma/client';

// // Creamos un tipo que incluye las relaciones que necesitamos
// const userWithBusiness = Prisma.validator<Prisma.UserDefaultArgs>()({
//     include: { 
//         ownedBusiness: true,
//         business: true // El negocio en el que es empleado
//     }
// });

// export type UserWithBusiness = Prisma.UserGetPayload<typeof userWithBusiness>;

export const authLogin = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ 
        where: { email },
        include: {
            ownedBusiness: true, // Incluye el negocio del que es propietario
            business: true,    // Incluye el negocio en el que es empleado
        }
    });

    if (!user) {
        return false
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return false
    }

    return user;
}