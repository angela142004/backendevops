import { Router } from "express";
import { updateEnlace } from "../controllers/enlaces.controller.js";
import {
  authMiddleware,
  validateApiKey,
  requireAdmin,
} from "../middlewares/auth.js";

const router = Router();

// Rutas públicas protegidas solo por API_KEY

// Rutas protegidas (requieren JWT y admin)
router.put(
  "/edit/:id",
  validateApiKey,
  authMiddleware,
  requireAdmin,
  updateEnlace
);

export default router;
