import { Router } from "express";
import { userController } from "../controllers/userController.js";

const router = Router();

router.post("/cadastro", userController.cadastro);

export default router;