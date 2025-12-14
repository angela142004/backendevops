import request from 'supertest';
import app from '../../../src/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('GET /prisma/post/public/:id - Public Post By ID - E2E', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Caso: obtener post que no existe (retorna 404, NO 401)
  it('should return 404 when post ID does not exist', async () => {
    const res = await request(app)
      .get('/prisma/post/public/99999999')
      .set('x-api-key', process.env.API_KEY);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  // Caso test env: sin API_KEY en test env hace bypass
  it('should return 404 even without API_KEY in test env', async () => {
    const res = await request(app).get('/prisma/post/public/99999999');

    // En test env validateApiKey hace bypass, luego authMiddleware también
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  // Caso test env: API_KEY inválida también hace bypass
  it('should return 404 even with invalid API_KEY in test env', async () => {
    const res = await request(app)
      .get('/prisma/post/public/99999999')
      .set('x-api-key', 'invalid_api_key');

    expect(res.status).toBe(404);
  });
});
