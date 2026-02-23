import { z } from 'zod';

export const createBookingSchema = z.object({
  startTime: z.string().datetime(),
  businessId: z.string().uuid(),
  employeeId: z.string().uuid(),
  serviceId: z.string().uuid(),
  // Customer can be either a registered user or a guest
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.customerId) {
    return;
  }
  if (!data.customerName || !data.customerEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debe proporcionar un ID de cliente o los datos del invitado (nombre y email).',
    });
  }
});
