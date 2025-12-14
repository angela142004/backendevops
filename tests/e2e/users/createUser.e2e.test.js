import request from 'supertest';
import app from '../../../src/index.js';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('POST /prisma/users - Create User - E2E', () => {
  let adminToken;
  let nonAdminToken;

  beforeAll(async () => {
    // Generar tokens JWT válidos (sin crear usuarios)
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

  // Caso error: sin token JWT
  it('should return 401 when no JWT token is provided', async () => {
    const res = await request(app)
      .post('/prisma/users')
      .set('x-api-key', process.env.API_KEY)
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePass123',
        is_admin: false,
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // Caso error: token JWT inválido
  it('should return 401 with invalid JWT token', async () => {
    const res = await request(app)
      .post('/prisma/users')
      .set('x-api-key', process.env.API_KEY)
      .set('Authorization', 'Bearer invalid_token_xyz')
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePass123',
        is_admin: false,
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // Caso error: token válido pero sin permisos admin
  it('should return 403 when user is not admin', async () => {
    const res = await request(app)
      .post('/prisma/users')
      .set('x-api-key', process.env.API_KEY)
      .set('Authorization', `Bearer ${nonAdminToken}`)
      .send({
        username: 'another',
        email: 'another@example.com',
        password: 'SecurePass123',
        is_admin: false,
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });
});
