import prisma from '../prisma/client';
import { add, format, parseISO } from 'date-fns';
import { NotFoundError } from '../utils/errors';

export const getAvailability = async (serviceId: string, date: string) => {
  const targetDate = parseISO(date);
  const dayOfWeek = targetDate.getDay();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new NotFoundError('Servicio no encontrado');

  const employees = await prisma.user.findMany({
    where: {
      role: 'EMPLOYEE',
      employeeServices: { some: { serviceId } },
      workSchedules: { some: { dayOfWeek } },
    },
    include: {
      workSchedules: { where: { dayOfWeek } },
      bookingsAsEmployee: {
        where: {
          startTime: {
            gte: targetDate,
            lt: add(targetDate, { days: 1 }),
          },
        },
      },
    },
  });

  const availability = employees.map((employee) => {
    const workSchedule = employee.workSchedules[0];
    const startTime = new Date(`${date}T${workSchedule.startTime}:00`);
    const endTime = new Date(`${date}T${workSchedule.endTime}:00`);

    const slots = [];
    let currentTime = startTime;

    while (add(currentTime, { minutes: service.duration }) <= endTime) {
      const slotEnd = add(currentTime, { minutes: service.duration });

      const isBooked = employee.bookingsAsEmployee.some(
        (booking) =>
          (currentTime >= booking.startTime && currentTime < booking.endTime) ||
          (slotEnd > booking.startTime && slotEnd <= booking.endTime)
      );

      if (!isBooked) {
        slots.push(format(currentTime, 'HH:mm'));
      }

      currentTime = add(currentTime, { minutes: service.duration }); // Advance by service duration
    }

    return {
      employeeId: employee.id,
      name: employee.name,
      availableSlots: slots,
    };
  });

  return availability.filter((e) => e.availableSlots.length > 0);
};
