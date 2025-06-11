import { Router } from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  getPublicPosts,
  getPublicPostById,
} from "../controllers/post.controller.js";

import { loginUser } from "../controllers/auth.controller.js";
import {
  authMiddleware,
  requireAdmin,
  validateApiKey,
} from "../middlewares/auth.js";

const router = Router();

// Aplicar validación de API_KEY a todas las rutas
router.use(validateApiKey);

// ✅ Rutas públicas (NO requieren autenticación pero sí API_KEY)
router.get("/post/page", getPublicPosts); // Endpoint público
router.get("/post/public/:id", getPublicPostById);

// ✅ Middleware de autenticación para rutas protegidas
router.use(authMiddleware);

// 🔒 Rutas protegidas (requieren autenticación)
router.get("/post", requireAdmin, getPosts);
router.get("/post/:user", getMyPosts);
router.get("/post/e/:id", getPostById);
router.post("/post", createPost);
router.put("/post/:id", updatePost);
router.delete("/post/:id", deletePost);

export default router;
