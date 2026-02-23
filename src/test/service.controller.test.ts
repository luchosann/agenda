import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import { generateToken } from '../utils/jwt';

let ownerToken: string;
let otherUserToken: string;
let businessId: string;
let businessSlug: string; // Guardar el slug
let serviceId: string;

describe('Service API', () => {
  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: {
        email: 'owner-service@test.com',
        password: 'password',
        name: 'Service Test Owner',
        role: 'ADMIN',
      },
    });
    ownerToken = generateToken({ id: owner.id, email: owner.email });

    const otherUser = await prisma.user.create({
        data: {
          email: 'other-service@test.com',
          password: 'password',
          name: 'Other User',
        },
      });
    otherUserToken = generateToken({ id: otherUser.id, email: otherUser.email });

    const business = await prisma.business.create({
        data: {
            name: 'Test Business for Services',
            slug: 'test-business-for-services',
            owner: { connect: { id: owner.id } },
        }
    });
    businessId = business.id;
    businessSlug = business.slug!;
  });

  afterAll(async () => {
    await prisma.service.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create a service for a business', async () => {
    const res = await request(app)
      .post(`/services`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Test Service',
        duration: 60,
        price: 50,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe('Test Service');
    serviceId = res.body.id;
  });

  it('should not create a service for a business if not the owner', async () => {
    const res = await request(app)
      .post(`/services`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        name: 'Unauthorized Service',
        duration: 30,
        price: 25,
      });
    expect(res.statusCode).toEqual(403);
  });

  it('should get all services for a business', async () => {
    const res = await request(app).get(`/services`).set('Host', `${businessSlug}.test.com`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a service for the owner', async () => {
    const res = await request(app)
      .put(`/services/${serviceId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ price: 55 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.price).toBe(55);
  });

  it('should not update a service for another user', async () => {
    const res = await request(app)
      .put(`/services/${serviceId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ price: 60 });
    expect(res.statusCode).toEqual(403);
  });

  it('should not delete a service for another user', async () => {
    const res = await request(app)
      .delete(`/services/${serviceId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it('should delete a service for the owner', async () => {
    const res = await request(app)
      .delete(`/services/${serviceId}`)
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toEqual(204);
  });
});
