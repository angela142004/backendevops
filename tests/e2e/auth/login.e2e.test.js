import request from 'supertest';
import app from '../../../src/index.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('POST /prisma/login - E2E', () => {
  beforeAll(async () => {
    // Limpiar tabla de usuarios y restaurar estado
    await prisma.post.deleteMany({});
    await prisma.postType.deleteMany({});
    await prisma.user.deleteMany({});

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('Password123', 10);
    await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password_hash: hashedPassword,
        is_admin: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Caso éxito: login válido con credenciales correctas
  it('should return 200 and JWT token with valid credentials', async () => {
    const res = await request(app)
      .post('/prisma/login')
      .set('x-api-key', process.env.API_KEY)
      .send({
        email: 'test@example.com',
        password: 'Password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  // Caso error: email o contraseña vacía
  it('should return 400 when email or password is empty', async () => {
    const res = await request(app)
      .post('/prisma/login')
      .set('x-api-key', process.env.API_KEY)
      .send({
        email: '',
        password: '',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('requeridos');
  });

  // Caso error: credenciales inválidas
  it('should return 401 with invalid credentials', async () => {
    const res = await request(app)
      .post('/prisma/login')
      .set('x-api-key', process.env.API_KEY)
      .send({
        email: 'test@example.com',
        password: 'WrongPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('inválid');
  });

  // Caso error: usuario no existe
  it('should return 401 when user does not exist', async () => {
    const res = await request(app)
      .post('/prisma/login')
      .set('x-api-key', process.env.API_KEY)
      .send({
        email: 'nonexistent@example.com',
        password: 'AnyPassword123',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
