import "dotenv/config";
import request from "supertest";
import app from "../src/index.js";

describe("POST /prisma/login", () => {
  it("debería responder con 200 y un token si las credenciales son válidas", async () => {
    const res = await request(app)
      .post("/prisma/login")
      .set("x-api-key", process.env.API_KEY)
      .send({
        email: "admin@mail.com", // Reemplaza con un usuario real de tu BD
        password: "admin123", // Reemplaza con su contraseña real
      });

    console.log(res.body); // Puedes ver el resultado completo

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("debería responder con 401 si las credenciales son inválidas", async () => {
    const res = await request(app)
      .post("/prisma/login")
      .set("x-api-key", process.env.API_KEY)
      .send({
        email: "noexiste@colegio.com",
        password: "contraseñamal",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
  it("debería responder con 400 si faltan campos en la solicitud", async () => {
    const res = await request(app)
      .post("/prisma/login")
      .set("x-api-key", process.env.API_KEY)
      .send({ email: "", password: "" }); // ambos vacíos

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
