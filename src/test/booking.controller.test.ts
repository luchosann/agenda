import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import { generateToken } from '../utils/jwt';
import { add, format, parseISO } from 'date-fns';

let ownerToken: string;
let businessId: string;
let employeeId: string;
let serviceId: string;
let customerId: string;

const API_HOST = 'api.test.com';

describe('Booking API', () => {
  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: {
        email: 'owner-booking@test.com',
        password: 'password',
        name: 'Booking Test Owner',
        role: 'ADMIN',
      },
    });
    ownerToken = generateToken({ id: owner.id, email: owner.email });

    const business = await prisma.business.create({
        data: {
            name: 'Test Business for Bookings',
            slug: 'test-business-for-bookings',
            owner: { connect: { id: owner.id } },
        }
    });
    businessId = business.id;

    const employee = await prisma.user.create({
        data: {
            email: 'employee-booking@test.com',
            password: 'password',
            name: 'Booking Test Employee',
            role: 'EMPLOYEE',
            business: { connect: { id: businessId } },
        }
    });
    employeeId = employee.id;

    const service = await prisma.service.create({
        data: {
            name: 'Test Service for Booking',
            duration: 60,
            price: 100,
            business: { connect: { id: businessId } },
        }
    });
    serviceId = service.id;

    await prisma.employeeService.create({
        data: {
            employee: { connect: { id: employeeId } },
            service: { connect: { id: serviceId } },
        }
    });

    // Create a work schedule for the employee (Monday 09:00-17:00)
    await prisma.workSchedule.create({
        data: {
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '17:00',
            employee: { connect: { id: employeeId } },
        }
    });

    const customer = await prisma.user.create({
        data: {
            email: 'customer-booking@test.com',
            password: 'password',
            name: 'Booking Test Customer',
            role: 'CLIENT',
        }
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.workSchedule.deleteMany();
    await prisma.employeeService.deleteMany();
    await prisma.service.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create a new booking', async () => {
    const today = new Date();
    const nextMonday = add(today, { days: (1 + 7 - today.getDay()) % 7 }); // Get next Monday
    const dateString = format(nextMonday, 'yyyy-MM-dd');
    const startTime = parseISO(`${dateString}T10:00:00`);

    const res = await request(app)
      .post('/bookings')
      .set('Host', API_HOST)
      .send({
        startTime: startTime.toISOString(),
        customerId,
        businessId,
        employeeId,
        serviceId,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.startTime).toBe(startTime.toISOString());
  });

  it('should not create a booking if the slot is not available', async () => {
    const today = new Date();
    const nextMonday = add(today, { days: (1 + 7 - today.getDay()) % 7 }); // Get next Monday
    const dateString = format(nextMonday, 'yyyy-MM-dd');
    const startTime = parseISO(`${dateString}T10:00:00`);

    // Create a conflicting booking
    await prisma.booking.create({
        data: {
            startTime: startTime,
            endTime: add(startTime, { minutes: 60 }),
            customerId,
            businessId,
            employeeId,
            serviceId,
        }
    });

    const res = await request(app)
      .post('/bookings')
      .set('Host', API_HOST)
      .send({
        startTime: startTime.toISOString(),
        customerId,
        businessId,
        employeeId,
        serviceId,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('El empleado no está disponible en ese horario.');
  });
});
