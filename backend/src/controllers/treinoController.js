import { treinoService } from "../services/treinoService.js";`1`

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
      const { diaId, exercicioId, series, repeticoes, descanso, peso } = req.body;

      const resultado = await treinoService.incluirTreino(userId, { diaId, exercicioId, series, repeticoes, descanso, peso });

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno ao incluir treino",
      });
    }
  }
}