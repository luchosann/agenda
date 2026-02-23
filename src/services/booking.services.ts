import prisma from '../prisma/client';
import { add } from 'date-fns';
import { CreateBookingInput } from '../models/booking.model';
import { NotFoundError, BadRequestError } from '../utils/errors';

export const createBooking = async (data: {
  startTime: Date;
  businessId: string;
  employeeId: string;
  serviceId: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}) => {
  // Check if business, employee, and service exist
  const [business, employee, service] = await prisma.$transaction([
    prisma.business.findUnique({ where: { id: data.businessId } }),
    prisma.user.findUnique({ where: { id: data.employeeId } }),
    prisma.service.findUnique({ where: { id: data.serviceId } }),
  ]);

  if (!business) throw new NotFoundError('Negocio no encontrado');
  if (!employee) throw new NotFoundError('Empleado no encontrado');
  if (!service) throw new NotFoundError('Servicio no encontrado');

  // If customerId is provided, check if customer exists
  if (data.customerId) {
    const customer = await prisma.user.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new NotFoundError('Cliente no encontrado');
  } else if (!data.customerName || !data.customerEmail) {
    // This case should ideally be caught by Zod schema validation, but as a fallback
    throw new Error('Debe proporcionar un ID de cliente o los datos del invitado (nombre y email).');
  }

  // Calculate endTime based on service duration
  const endTime = new Date(data.startTime.getTime() + service.duration * 60 * 1000);

  // Check for employee availability (simplified: no overlaps)
  const existingBookings = await prisma.booking.findMany({
    where: {
      employeeId: data.employeeId,
      startTime: { lt: endTime },
      endTime: { gt: data.startTime },
    },
  });

  if (existingBookings.length > 0) {
    throw new BadRequestError('El empleado no está disponible en ese horario.');
  }

  const booking = await prisma.booking.create({
    data: {
      startTime: data.startTime,
      endTime,
      businessId: data.businessId,
      employeeId: data.employeeId,
      serviceId: data.serviceId,
      ...(data.customerId && { customerId: data.customerId }),
      ...(data.customerName && { customerName: data.customerName }),
      ...(data.customerEmail && { customerEmail: data.customerEmail }),
      ...(data.customerPhone && { customerPhone: data.customerPhone }),
    },
  });

  return booking;
};

export const getBookingById = async (id: string) => {
  return await prisma.booking.findUnique({ where: { id } });
};

export const getAllBookingsByBusiness = async (businessId: string) => {
  return await prisma.booking.findMany({
    where: { businessId },
    include: {
      service: true, // Incluir detalles del servicio
      employee: {
        select: { name: true } // Incluir nombre del empleado
      }
    },
    orderBy: {
      startTime: 'asc' // Ordenar por fecha de inicio
    }
  });
};
