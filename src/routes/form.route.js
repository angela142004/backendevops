import { Router } from "express";
import {
  createSubmission,
  getSubmissions,
  deleteSubmission,
} from "../controllers/form.controller.js";
import {
  authMiddleware,
  requireAdmin,
  validateApiKey,
} from "../middlewares/auth.js";

const router = Router();
// Esta ruta es pública y solo requiere que se envíe el header "x-api-key" válido.
// No se valida el JWT en este endpoint.


router.use(authMiddleware);
// Estas rutas requieren que se envíe un JWT válido y además que el usuario tenga privilegios de administrador.
router.get("/getform", requireAdmin, getSubmissions);
router.delete("/delfrom/:id", requireAdmin, deleteSubmission);

export default router;
