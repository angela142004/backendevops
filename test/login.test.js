import "dotenv/config";
import request from "supertest";
import app from "../src/index.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

beforeAll(async () => {
  // 🔁 Limpia el usuario si existe
  await prisma.user.deleteMany({ where: { email: "admin@mail.com" } });

  // ✅ Crea uno nuevo con contraseña hasheada
  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@mail.com",
      password_hash: await bcrypt.hash("admin123", 10),
      is_admin: true,
    },
  });
});

describe("POST /prisma/login", () => {
  it("debería responder con 200 y un token si las credenciales son válidas", async () => {
    const res = await request(app)
      .post("/prisma/login")
      .set("x-api-key", process.env.API_KEY) // asegúrate  que coincida con tu backend
      .send({
        email: "admin@mail.com",
        password: "admin123",
      });

    console.log(res.body); // 👀 Verifica aquí si te da un error
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("debería responder con 401 si las credenciales son inválidas", async () => {
    const res = await request(app)
      .post("/prisma/login")
      .set("x-api-key", process.env.API_KEY)
      .send({
        email: "noexiste@mail.com",
        password: "malapass",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("debería responder con 400 si faltan campos", async () => {
    const res = await request(app)
      .post("/prisma/login")
      .set("x-api-key", process.env.API_KEY)
      .send({ email: "", password: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

// // Integration test file - placeholder while main tests are commented out
// describe('Login Integration Tests', () => {
//   it('should have placeholder test', () => {
//     expect(true).toBe(true);
//   });
// });

/*

//   it("debería responder con 400 si faltan campos", async () => {
//     const res = await request(app)
//       .post("/prisma/login")
//       .set("x-api-key", process.env.API_KEY)
//       .send({ email: "", password: "" });

//     expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty("error");
//   });
// });
*/

// afterAll(async () => {
//   await prisma.$disconnect();
// });

