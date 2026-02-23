import prisma from '../prisma/client';

export const getDashboardData = async (businessId: string) => {
  const totalBookings = await prisma.booking.count({
    where: { businessId },
  });

  const bookings = await prisma.booking.findMany({
    where: { businessId },
    include: { service: true },
  });
  const totalRevenue = bookings.reduce((acc, booking) => acc + booking.service.price, 0);

  const bookingsPerEmployee = await prisma.booking.groupBy({
    by: ['employeeId'],
    where: { businessId },
    _count: {
      _all: true,
    },
  });

  const mostPopularServices = await prisma.booking.groupBy({
    by: ['serviceId'],
    where: { businessId },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        serviceId: 'desc',
      },
    },
    take: 5,
  });

  return {
    totalBookings,
    totalRevenue,
    bookingsPerEmployee,
    mostPopularServices,
  };
};
