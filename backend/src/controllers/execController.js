import { execService } from "../services/execService.js";

export class execController {
  static async treinos(req, res) {
    try {
      const userId = req.user.id;

      const resultado = await execService.treinos(userId);

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno ao buscar treinos",
      });
    }
  }
}