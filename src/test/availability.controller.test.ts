import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import { generateToken } from '../utils/jwt';
import { add, format, parseISO } from 'date-fns';

let ownerToken: string;
let businessId: string;
let employeeId: string;
let serviceId: string;
let employeeEmail: string;

const API_HOST = 'api.test.com';

describe('Availability API', () => {
  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: {
        email: 'owner-availability@test.com',
        password: 'password',
        name: 'Availability Test Owner',
        role: 'ADMIN',
      },
    });
    ownerToken = generateToken({ id: owner.id, email: owner.email });

    const business = await prisma.business.create({
        data: {
            name: 'Test Business for Availability',
            slug: 'test-business-for-availability',
            owner: { connect: { id: owner.id } },
        }
    });
    businessId = business.id;

    const employee = await prisma.user.create({
        data: {
            email: 'employee-availability@test.com',
            password: 'password',
            name: 'Availability Test Employee',
            role: 'EMPLOYEE',
            business: { connect: { id: businessId } },
        }
    });
    employeeId = employee.id;
    employeeEmail = employee.email;

    const service = await prisma.service.create({
        data: {
            name: 'Test Service for Availability',
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
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.workSchedule.deleteMany();
    await prisma.employeeService.deleteMany();
    await prisma.service.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should return available slots for a service and date', async () => {
    const today = new Date();
    const nextMonday = add(today, { days: (1 + 7 - today.getDay()) % 7 }); // Get next Monday
    const dateString = format(nextMonday, 'yyyy-MM-dd');

    const res = await request(app)
      .get(`/availability?serviceId=${serviceId}&date=${dateString}`)
      .set('Host', API_HOST);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].employeeId).toBe(employeeId);
    expect(res.body[0].availableSlots.length).toBeGreaterThan(0);
  });

  it('should not return slots if employee has a booking', async () => {
    const today = new Date();
    const nextMonday = add(today, { days: (1 + 7 - today.getDay()) % 7 }); // Get next Monday
    const dateString = format(nextMonday, 'yyyy-MM-dd');

    // Create a booking for the employee on next Monday from 10:00 to 11:00
    const bookingStartTime = parseISO(`${dateString}T10:00:00`);
    const bookingEndTime = parseISO(`${dateString}T11:00:00`);

    await prisma.booking.create({
        data: {
            startTime: bookingStartTime,
            endTime: bookingEndTime,
            customerId: employeeId, // Using employeeId as customerId for simplicity in test
            businessId: businessId,
            employeeId: employeeId,
            serviceId: serviceId,
        }
    });

    const res = await request(app)
      .get(`/availability?serviceId=${serviceId}&date=${dateString}`)
      .set('Host', API_HOST);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].employeeId).toBe(employeeId);
    expect(res.body[0].availableSlots).not.toContain('10:00');
  });
});
