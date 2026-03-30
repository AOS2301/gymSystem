import { Router } from "express";
import { AuthController } from "../controller/AuthController.js";

const router = Router();

router.post("/login", AuthController.login);

router.post("/cadastro", AuthController.cadastro);

export default router;
