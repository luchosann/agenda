import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import { generateToken } from '../utils/jwt';

let ownerToken: string;
let otherUserToken: string;
let ownerId: string;
let businessId: string;
let businessSlug: string; // Variable para guardar el slug

const API_HOST = 'api.test.com'; // Host para la API principal

describe('Business API', () => {
  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: {
        email: 'owner@test.com',
        password: 'password',
        name: 'Test Owner',
        role: 'ADMIN',
      },
    });
    ownerId = owner.id;
    ownerToken = generateToken({ id: owner.id, email: owner.email });

    const otherUser = await prisma.user.create({
        data: {
          email: 'other@test.com',
          password: 'password',
          name: 'Other User',
        },
      });
    otherUserToken = generateToken({ id: otherUser.id, email: otherUser.email });
  });

  afterAll(async () => {
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should get all businesses from API subdomain', async () => {
    const res = await request(app).get('/businesses').set('Host', API_HOST);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a business from API subdomain', async () => {
    const res = await request(app)
      .post('/businesses')
      .set('Host', API_HOST)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Test Business',
        address: '123 Test St',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe('Test Business');
    expect(res.body.ownerId).toBe(ownerId);
    businessId = res.body.id;
    businessSlug = res.body.slug; // Guardamos el slug
  });

  it('should not create a business for an unauthenticated user', async () => {
    const res = await request(app)
      .post('/businesses')
      .set('Host', API_HOST)
      .send({
        name: 'Unauthorized Business',
      });
    expect(res.statusCode).toEqual(401);
  });

  it('should get business data from its own subdomain', async () => {
    const res = await request(app).get('/').set('Host', `${businessSlug}.test.com`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toBe(businessId);
  });

  it('should update a business from its own subdomain', async () => {
    const res = await request(app)
      .put('/')
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Updated Business Name' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe('Updated Business Name');
    // Actualizamos el slug para los siguientes tests
    businessSlug = res.body.slug;
  });

  it('should not update a business for another user', async () => {
    const res = await request(app)
      .put('/')
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ name: 'Should Not Update' });
    expect(res.statusCode).toEqual(403);
  });

  it('should not delete a business for another user', async () => {
    const res = await request(app)
      .delete('/')
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it('should delete a business for the owner from its own subdomain', async () => {
    const res = await request(app)
      .delete('/')
      .set('Host', `${businessSlug}.test.com`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toEqual(204);
  });
});
