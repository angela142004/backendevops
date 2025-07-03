import { Router } from "express";
import {
  updateEnlace
} from "../controllers/enlaces.controller.js";
import { authMiddleware, requireAdmin } from "../middlewares/auth.js";

const router = Router();


// Rutas protegidas (requieren JWT y admin)
router.use(authMiddleware);
router.put("/edit/:id", requireAdmin, updateEnlace);

export default router;
