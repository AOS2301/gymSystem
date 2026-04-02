import { treinoService } from "../services/treinoService.js";

export class treinoController {
  static async listarTreinos(req, res) {
    try {
      const userId = req.user.id;

      const resultado = await treinoService.listarTreinos(userId);

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno ao buscar treinos",
      });
    }
  }

  static async incluirTreino(req, res) {
    try {
      const userId = req.user.id;
      const { diaId, nome, series, reps, peso } = req.body;

      const resultado = await treinoService.incluirTreino(userId, { diaId, nome, series, reps, peso });

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno ao buscar treinos",
      });
    }
  }
}