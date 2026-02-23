import request from 'supertest';
import app from '../app';

const API_HOST = 'api.test.com';

describe('User Controller', () => {
  let createdUserId: string;

  it('POST /users - crea un usuario', async () => {
    const res = await request(app)
      .post('/users')
      .set('Host', API_HOST)
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'CLIENT'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdUserId = res.body.id;
  });

  it('POST /users - falla con datos inválidos', async () => {
    const res = await request(app)
      .post('/users')
      .set('Host', API_HOST)
      .send({
        email: 'no-es-un-email'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /users/:id - obtiene un usuario por id', async () => {
    const res = await request(app)
      .get(`/users/${createdUserId}`)
      .set('Host', API_HOST);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdUserId);
  });

  it('PUT /users/:id - actualiza un usuario', async () => {
    const res = await request(app)
      .put(`/users/${createdUserId}`)
      .set('Host', API_HOST)
      .send({
        name: 'Updated User',
        role: 'ADMIN'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdUserId);
    expect(res.body.name).toBe('Updated User');
    expect(res.body.role).toBe('ADMIN');
  });

  it('DELETE /users/:id - elimina un usuario', async () => {
    const res = await request(app)
      .delete(`/users/${createdUserId}`)
      .set('Host', API_HOST);

    expect(res.statusCode).toBe(204);
  });

  it('GET /users/:id - devuelve 404 para usuario no encontrado', async () => {
    const res = await request(app)
      .get(`/users/${createdUserId}`)
      .set('Host', API_HOST);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
  });

  it('DELETE /users/:id - devuelve 404 para usuario no encontrado', async () => {
    const res = await request(app)
      .delete(`/users/${createdUserId}`)
      .set('Host', API_HOST);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
  });
});
