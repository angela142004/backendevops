import jwt from "jsonwebtoken";
import { JWT_SECRET, API_KEY } from "../config/env.js";

function authMiddleware(req, res, next) {
  // Permitir pasar sin autenticación durante pruebas
  if (process.env.NODE_ENV === "test") return next();

  if (req.path === "/post/page" || req.path.startsWith("/post/public/")) {
    return next(); // Permitir acceso
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ error: "Solo administradores" });
  }
  next();
}

const validateApiKey = (req, res, next) => {
  // Permitir pasar en entorno de test sin verificar la API Key
  if (process.env.NODE_ENV === "test") return next();

  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({
      error: "API Key inválida o no proporcionada",
    });
  }
  next();
};

export { authMiddleware, requireAdmin, validateApiKey };
