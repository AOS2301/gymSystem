import { Router } from "express";
import { treinoController } from "../controllers/treinoController.js";
import { authGuard } from "../guard/auth.guard.js";

const router = Router();

router.get("/treino", authGuard, treinoController.listarTreinos);
router.get("/existe", authGuard, treinoController.verificarExistenciaTreinos);
router.post("/treino", authGuard, treinoController.incluirTreino);
router.post("/importar", authGuard, treinoController.importarTreinos);
router.post("/adicionarPDF", authGuard, treinoController.adicionarPDF);
router.delete("/treino", authGuard, treinoController.removerTreino);
router.delete("/removeTodos", authGuard, treinoController.removerTodos);
router.patch("/treino/:id", authGuard, treinoController.atualizarTreino);
router.patch("/treino/:diaId/ordem", authGuard, treinoController.reordenarTreinos);

export default router;