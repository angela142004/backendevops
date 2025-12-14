import request from 'supertest';
import app from '../../../src/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('POST /prisma/upform - Form Submission - E2E', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Caso éxito: crear submission con todos los campos requeridos
  it('should return 201 and create form submission with valid data', async () => {
    const res = await request(app)
      .post('/prisma/upform')
      .set('x-api-key', process.env.API_KEY)
      .send({
        nombre: 'Juan Pérez',
        dni: '12345678',
        telefono: '555-1234',
        correo: 'juan@example.com',
        grado: '5to',
        nivel: 'primaria',
        colegio_procedencia: 'Colegio XYZ',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('nombre', 'Juan Pérez');
    expect(res.body).toHaveProperty('correo', 'juan@example.com');
  });

  // Caso error: campos faltantes
  it('should return 500 when required fields are missing', async () => {
    const res = await request(app)
      .post('/prisma/upform')
      .set('x-api-key', process.env.API_KEY)
      .send({
        nombre: 'Test',
        // Falta: dni, telefono, correo, grado, nivel, colegio_procedencia
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  // Caso test env: sin API_KEY hace bypass pero falta validación de datos
  it('should return 500 when API_KEY is missing and fields incomplete', async () => {
    const res = await request(app)
      .post('/prisma/upform')
      .send({
        nombre: 'Test',
        // Falta: dni, telefono, correo, grado, nivel
      });

    // En test env validateApiKey hace bypass pero controller valida datos
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
