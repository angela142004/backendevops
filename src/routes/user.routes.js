// src/routes/user.routes.js
import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { loginUser } from "../controllers/auth.controller.js";
import { createSubmission } from "../controllers/form.controller.js";
import {
  getEnlacesHome,
  getEnlacesBlog,
} from "../controllers/enlaces.controller.js";
import {
  authMiddleware,
  requireAdmin,
  validateApiKey,
} from "../middlewares/auth.js";

const router = Router();

// Aplicar validación de API_KEY a todas las rutas

router.use(validateApiKey);

router.post("/login", loginUser); // Endpoint público
router.post("/upform", createSubmission);
router.get("/home", getEnlacesHome);
router.get("/blog", getEnlacesBlog);

// Aplica el middleware de autenticación a las rutas que lo requieren
router.use(authMiddleware); // ✅ Middleware de autenticación

router.get("/users", getUsers); // ✅ GET all users
router.get("/users/:id", requireAdmin, getUserById); // ✅ GET user by ID
router.post("/users", requireAdmin, createUser); // ✅ POST create user
router.put("/users/:id", requireAdmin, updateUser); // ✅ PUT update user
router.delete("/users/:id", requireAdmin, deleteUser); // ✅ DELETE delete user

export default router;
