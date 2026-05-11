import { Router } from "express";
import { treinoController } from "../controllers/treinoController.js";
import { authGuard } from "../guard/auth.guard.js";

const router = Router();

router.get("/treino", authGuard, treinoController.listarTreinos);
router.post("/treino", authGuard, treinoController.incluirTreino);
router.post("/importar", authGuard, treinoController.importarTreinos);
router.delete("/treino", authGuard, treinoController.removerTreino);
router.patch("/treino/:id", authGuard, treinoController.atualizarTreino);
router.patch("/treino/:diaId/ordem", authGuard, treinoController.reordenarTreinos);

export default router;