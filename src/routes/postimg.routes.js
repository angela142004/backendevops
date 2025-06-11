import { Router } from "express";
import {
  authMiddleware,
  requireAdmin,
  validateApiKey,
} from "../middlewares/auth.js";

const router = Router();

// Aplicar validación de API_KEY a todas las rutas
router.use(validateApiKey);

//USER NORMAL


//


export default router;