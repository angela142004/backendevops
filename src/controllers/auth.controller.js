import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config/env.js";

const prisma = new PrismaClient();

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const isMatch =
      user && (await bcrypt.compare(password, user.password_hash));
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // El token debe incluir id, email e is_admin para que el middleware funcione correctamente
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
