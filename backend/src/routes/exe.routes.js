import { Router } from "express";
import { exeController } from "../controllers/exeController.js";
import { authGuard } from "../guard/auth.guard.js";

const router = Router();

router.get("/exercicios", authGuard, exeController.listarExercicios);
export default router;