import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import { generateToken } from '../utils/jwt';

let ownerToken: string;
let employeeToken: string;
let otherUserToken: string;
let businessId: string;
let businessSlug: string; // Guardar el slug
let employeeId: string;
let scheduleId: string;

describe('WorkSchedule API', () => {
  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: {
        email: 'owner-schedule@test.com',
        password: 'password',
        name: 'Schedule Test Owner',
        role: 'ADMIN',
      },
    });
    ownerToken = generateToken({ id: owner.id, email: owner.email });

    const business = await prisma.business.create({
        data: {
            name: 'Test Business for Schedules',
            slug: 'test-business-for-schedules',
            owner: { connect: { id: owner.id } },
        }
    });
    businessId = business.id;
    businessSlug = business.slug!;

    const employee = await prisma.user.create({
        data: {
            email: 'employee-schedule@test.com',
            password: 'password',
            name: 'Schedule Test Employee',
            role: 'EMPLOYEE',
            business: { connect: { id: businessId } },
        }
    });
    employeeId = employee.id;
    employeeToken = generateToken({ id: employee.id, email: employee.email });

    const otherUser = await prisma.user.create({
        data: {
          email: 'other-schedule@test.com',
          password: 'password',
          name: 'Other Schedule User',
        },
      });
    otherUserToken = generateToken({ id: otherUser.id, email: otherUser.email });
  });

  afterAll(async () => {
    await prisma.workSchedule.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create a work schedule for an employee', async () => {
    const res = await request(app)
      .post(`/employees/${employeeId}/work-schedules`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.employeeId).toBe(employeeId);
    scheduleId = res.body.id;
  });

  it('should not create a work schedule for another employee', async () => {
    const res = await request(app)
      .post(`/employees/${employeeId}/work-schedules`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '17:00',
      });
    expect(res.statusCode).toEqual(403);
  });

  it('should get all work schedules of an employee', async () => {
    const res = await request(app)
      .get(`/employees/${employeeId}/work-schedules`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((s: any) => s.id === scheduleId)).toBe(true);
  });

  it('should not get all work schedules of another employee', async () => {
    const res = await request(app)
      .get(`/employees/${employeeId}/work-schedules`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it('should update a work schedule for an employee', async () => {
    const res = await request(app)
      .put(`/employees/${employeeId}/work-schedules/${scheduleId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ endTime: '18:00' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.endTime).toBe('18:00');
  });

  it('should not update a work schedule for another employee', async () => {
    const res = await request(app)
      .put(`/employees/${employeeId}/work-schedules/${scheduleId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ endTime: '19:00' });
    expect(res.statusCode).toEqual(403);
  });

  it('should delete a work schedule for an employee', async () => {
    const res = await request(app)
      .delete(`/employees/${employeeId}/work-schedules/${scheduleId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toEqual(204);
  });

  it('should not delete a work schedule for another employee', async () => {
    // Recreate schedule for this test
    const resCreate = await request(app)
      .post(`/employees/${employeeId}/work-schedules`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '17:00',
      });
    const tempScheduleId = resCreate.body.id;

    const res = await request(app)
      .delete(`/employees/${employeeId}/work-schedules/${tempScheduleId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    expect(res.statusCode).toEqual(403);
  });
});
