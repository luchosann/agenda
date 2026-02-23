import type { Request, Response } from 'express';
import * as bookingServices from '../services/booking.services';
import { createBookingSchema } from '../schema/booking.schema';
import { NotFoundError } from '../utils/errors';

export const createBooking = async (req: Request, res: Response) => {
  const data = createBookingSchema.parse(req.body);
  const booking = await bookingServices.createBooking({ ...data, startTime: new Date(data.startTime) });
  return res.status(201).json(booking);
};

export const getBooking = async (req: Request, res: Response) => {
  const booking = await bookingServices.getBookingById(req.params.id);
  if (!booking) throw new NotFoundError('Reserva no encontrada');
  return res.json(booking);
};

export const getAllBookings = async (req: Request, res: Response) => {
  const businessId = (req as any).business.id;
  const bookings = await bookingServices.getAllBookingsByBusiness(businessId);
  return res.json(bookings);
};
