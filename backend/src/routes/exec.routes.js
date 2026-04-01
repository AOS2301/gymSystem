import { Router } from "express";
import { execController } from "../controllers/execController.js";
import { authGuard } from "../guard/auth.guard.js";

const router = Router();

router.get("/treino", authGuard, execController.treinos);

export default router;