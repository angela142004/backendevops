import request from 'supertest';
import app from '../../../src/index.js';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('POST /prisma/post - Create Post - E2E', () => {
  let userToken;

  beforeAll(async () => {
    // Generar token JWT válido (test auth layer)
    userToken = jwt.sign(
      {
        userId: 999,
        userName: 'testuser',
        email: 'test@example.com',
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
  it('should return 401 when no JWT token provided', async () => {
    const res = await request(app)
      .post('/prisma/post')
      .set('x-api-key', process.env.API_KEY)
      .send({
        title: 'Post Without Auth',
        content: 'Should fail without token',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // Caso error: token JWT inválido
  it('should return 401 with invalid JWT token', async () => {
    const res = await request(app)
      .post('/prisma/post')
      .set('x-api-key', process.env.API_KEY)
      .set('Authorization', 'Bearer invalid_token_xyz')
      .send({
        title: 'Post Invalid Token',
        content: 'Invalid token test',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // Caso error: token válido pero data incompleta
  it('should return 500 when required post fields are missing', async () => {
    const res = await request(app)
      .post('/prisma/post')
      .set('x-api-key', process.env.API_KEY)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Only title',
        // content y postTypeId faltantes
      });

    // Auth passes pero falta data -> controller error
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
