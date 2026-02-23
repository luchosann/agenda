import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import { generateToken } from '../utils/jwt';
import { add, format, parseISO } from 'date-fns';

let ownerToken: string;
let otherUserToken: string;
let businessId: string;
let businessSlug: string; // Guardar el slug
let employeeId: string;
let serviceId: string;
let customerId: string;

describe('Dashboard API', () => {
  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: {
        email: 'owner-dashboard@test.com',
        password: 'password',
        name: 'Dashboard Test Owner',
        role: 'ADMIN',
      },
    });
    ownerToken = generateToken({ id: owner.id, email: owner.email });

    const otherUser = await prisma.user.create({
        data: {
          email: 'other-dashboard@test.com',
          password: 'password',
          name: 'Other Dashboard User',
        },
      });
    otherUserToken = generateToken({ id: otherUser.id, email: otherUser.email });

    const business = await prisma.business.create({
        data: {
            name: 'Test Business for Dashboard',
            slug: 'test-business-for-dashboard',
            owner: { connect: { id: owner.id } },
        }
    });
    businessId = business.id;
    businessSlug = business.slug!;

    const employee = await prisma.user.create({
        data: {
            email: 'employee-dashboard@test.com',
            password: 'password',
            name: 'Dashboard Test Employee',
            role: 'EMPLOYEE',
            business: { connect: { id: businessId } },
        }
    });
    employeeId = employee.id;

    const service = await prisma.service.create({
        data: {
            name: 'Test Service for Dashboard',
            duration: 60,
            price: 100,
            business: { connect: { id: businessId } },
        }
    });
    serviceId = service.id;

    const customer = await prisma.user.create({
        data: {
            email: 'customer-dashboard@test.com',
            password: 'password',
            name: 'Dashboard Test Customer',
            role: 'CLIENT',
        }
    });
    customerId = customer.id;

    // Create some bookings for dashboard data
    const today = new Date();
    const nextMonday = add(today, { days: (1 + 7 - today.getDay()) % 7 });
    const dateString = format(nextMonday, 'yyyy-MM-dd');

    await prisma.booking.create({
        data: {
            startTime: parseISO(`${dateString}T09:00:00`),
            endTime: parseISO(`${dateString}T10:00:00`),
            customerId,
            businessId,
            employeeId,
            serviceId,
        }
    });

    await prisma.booking.create({
        data: {
            startTime: parseISO(`${dateString}T10:00:00`),
            endTime: parseISO(`${dateString}T11:00:00`),
            customerId,
            businessId,
            employeeId,
            serviceId,
        }
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.workSchedule.deleteMany();
    await prisma.employeeService.deleteMany();
    await prisma.service.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should return dashboard data for the business owner', async () => {
    const res = await request(app)
      .get(`/dashboard`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.totalBookings).toBe(2);
    expect(res.body.totalRevenue).toBe(200); // 2 bookings * 100 price
    expect(res.body.bookingsPerEmployee.length).toBeGreaterThan(0);
    expect(res.body.mostPopularServices.length).toBeGreaterThan(0);
  });

  it('should not return dashboard data for another user', async () => {
    const res = await request(app)
      .get(`/dashboard`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.statusCode).toEqual(403);
  });
});
