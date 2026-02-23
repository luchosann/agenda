import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import { generateToken } from '../utils/jwt';

let ownerToken: string;
let otherUserToken: string;
let businessId: string;
let businessSlug: string; // Guardar el slug de la empresa
let employeeId: string;
let serviceId: string;

describe('Employee API', () => {
  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: {
        email: 'owner-employee@test.com',
        password: 'password',
        name: 'Employee Test Owner',
        role: 'ADMIN',
      },
    });
    ownerToken = generateToken({ id: owner.id, email: owner.email });

    const otherUser = await prisma.user.create({
        data: {
          email: 'other-employee@test.com',
          password: 'password',
          name: 'Other Employee User',
        },
      });
    otherUserToken = generateToken({ id: otherUser.id, email: otherUser.email });

    const business = await prisma.business.create({
        data: {
            name: 'Test Business for Employees',
            slug: 'test-business-for-employees', // Asignar slug explícitamente para el test
            owner: { connect: { id: owner.id } },
        }
    });
    businessId = business.id;
    businessSlug = business.slug!;

    const service = await prisma.service.create({
        data: {
            name: 'Test Service for Employee',
            duration: 60,
            price: 100,
            business: { connect: { id: businessId } },
        }
    });
    serviceId = service.id;
  });

  afterAll(async () => {
    await prisma.employeeService.deleteMany();
    await prisma.service.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should add an employee to a business', async () => {
    const employeeUser = await prisma.user.create({
        data: {
            email: 'employee@test.com',
            password: 'password',
            name: 'Test Employee',
            role: 'CLIENT',
        }
    });
    employeeId = employeeUser.id;

    const res = await request(app)
      .post(`/employees`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: employeeUser.email });

    expect(res.statusCode).toEqual(201);
    expect(res.body.id).toBe(employeeId);
    expect(res.body.businessId).toBe(businessId);
    expect(res.body.role).toBe('EMPLOYEE');
  });

  it('should not add an employee to a business if not the owner', async () => {
    const employeeUser = await prisma.user.create({
        data: {
            email: 'unauthorized-employee@test.com',
            password: 'password',
            name: 'Unauthorized Employee',
            role: 'CLIENT',
        }
    });

    const res = await request(app)
      .post(`/employees`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ email: employeeUser.email });

    expect(res.statusCode).toEqual(403);
  });

  it('should get all employees of a business', async () => {
    const res = await request(app).get(`/employees`).set('Host', `${businessSlug}.test.com`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((e: any) => e.id === employeeId)).toBe(true);
  });

  it('should assign a service to an employee', async () => {
    const res = await request(app)
      .post(`/employees/${employeeId}/services`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ serviceId });

    expect(res.statusCode).toEqual(201);
    expect(res.body.employeeId).toBe(employeeId);
    expect(res.body.serviceId).toBe(serviceId);
  });

  it('should not assign a service to an employee if not the owner', async () => {
    const res = await request(app)
      .post(`/employees/${employeeId}/services`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ serviceId });

    expect(res.statusCode).toEqual(403);
  });

  it('should get services assigned to an employee', async () => {
    const res = await request(app).get(`/employees/${employeeId}/services`).set('Host', `${businessSlug}.test.com`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((s: any) => s.serviceId === serviceId)).toBe(true);
  });

  it('should remove a service from an employee', async () => {
    const res = await request(app)
      .delete(`/employees/${employeeId}/services/${serviceId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toEqual(204);
  });

  it('should not remove a service from an employee if not the owner', async () => {
    // Re-assign service for this test
    await request(app)
      .post(`/employees/${employeeId}/services`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ serviceId });

    const res = await request(app)
      .delete(`/employees/${employeeId}/services/${serviceId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.statusCode).toEqual(403);
  });

  it('should remove an employee from a business', async () => {
    const res = await request(app)
      .delete(`/employees/${employeeId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toEqual(204);
  });

  it('should not remove an employee from a business if not the owner', async () => {
    // Re-add employee for this test
    const employeeUser = await prisma.user.create({
        data: {
            email: 'employee-to-remove@test.com',
            password: 'password',
            name: 'Employee To Remove',
            role: 'CLIENT',
        }
    });
    const tempEmployeeId = employeeUser.id;
    await request(app)
      .post(`/employees`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: employeeUser.email });

    const res = await request(app)
      .delete(`/employees/${tempEmployeeId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.statusCode).toEqual(403);
  });
});
