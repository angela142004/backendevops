import request from 'supertest';
import app from '../../../src/index.js';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('GET /prisma/users - E2E', () => {
  let adminToken;
  let nonAdminToken;

  beforeAll(async () => {
    // Generar tokens JWT válidos (sin crear usuarios - test auth layer)
    adminToken = jwt.sign(
      {
        userId: 999,
        userName: 'admin',
        email: 'admin@example.com',
        is_admin: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    nonAdminToken = jwt.sign(
      {
        userId: 1000,
        userName: 'normaluser',
        email: 'normal@example.com',
        is_admin: false,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Caso éxito: obtener usuarios (requiere JWT válido)
  it('should return 200 with list of users when valid admin token is provided', async () => {
    const res = await request(app)
      .get('/prisma/users')
      .set('x-api-key', process.env.API_KEY)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Caso error: sin token JWT (requiere autenticación)
  it('should return 401 when no token is provided', async () => {
    const res = await request(app)
      .get('/prisma/users')
      .set('x-api-key', process.env.API_KEY);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // Caso error: token JWT inválido
  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/prisma/users')
      .set('x-api-key', process.env.API_KEY)
      .set('Authorization', 'Bearer invalid_token_xyz');

    expect(res.status).toBe(401);
  });
});
