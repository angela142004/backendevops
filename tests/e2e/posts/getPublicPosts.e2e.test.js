import request from 'supertest';
import app from '../../../src/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('GET /prisma/post/page - Public Posts - E2E', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Caso éxito: obtener posts públicos (API_KEY validada en producción)
  it('should return 200 with list of public posts with valid API_KEY', async () => {
    const res = await request(app)
      .get('/prisma/post/page')
      .set('x-api-key', process.env.API_KEY);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Caso test env: sin API_KEY puede pasar en test environment
  it('should return 200 even without API_KEY in test env', async () => {
    const res = await request(app).get('/prisma/post/page');

    // En test env validateApiKey hace bypass
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Caso test env: API_KEY inválida también puede pasar
  it('should return 200 even with invalid API_KEY in test env', async () => {
    const res = await request(app)
      .get('/prisma/post/page')
      .set('x-api-key', 'invalid_key_xyz');

    // En test env validateApiKey hace bypass
    expect(res.status).toBe(200);
  });
});
