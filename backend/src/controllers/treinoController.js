import { treinoService } from "../services/treinoService.js"; `1`

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
      const { diaId, exercicioId, series, repeticoes_min, repeticoes_max, descanso, peso } = req.body;

      const resultado = await treinoService.incluirTreino(userId, { diaId, exercicioId, series, repeticoes_min, repeticoes_max, descanso, peso });

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno ao incluir treino",
      });
    }
  }

  static async importarTreinos(req, res) {
    try {
      const userId = req.user.id;
      const { pdf } = req.body;

      if (!pdf) {
        return res.status(400).json({ message: "Nenhum arquivo PDF enviado" });
      }

      const resultado = await treinoService.importarTreinos(userId, { pdf });
      return res.status(200).json(resultado);
    } catch (error) {
      console.error("Erro ao importar treino:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async removerTreino(req, res) {
    try {
      const userId = req.user.id;
      const { diaId, exercicioId } = req.body;

      const resultado = await treinoService.removerTreino(userId, { diaId, exercicioId });

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno ao remover treino",
      });
    }
  }

  static async atualizarTreino(req, res) {
    try {
      const treinoId = Number(req.params.id);

      const { series, repeticoes_min, repeticoes_max, descanso, peso } = req.body;

      const resultado = await treinoService.atualizarTreino(
        treinoId,
        { series, repeticoes_min, repeticoes_max, descanso, peso }
      );

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno ao atualizar treino",
      });
    }
  }

  static async reordenarTreinos(req, res) {
    try {
      const userId = req.user.id;
      const { diaId } = req.params;
      const { exercicios } = req.body;

      const resultado = await treinoService.reordenarTreinos(
        userId,
        diaId,
        exercicios
      );

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno ao reordenar treinos",
      });
    }
  }


  static async adicionarPDF(req, res) {
    try {
      const userId = req.user.id;
      const { data } = req.body;

      if (!data) {
        return res.status(400).json({ message: "Campo 'data' é obrigatório." });
      }

      const resultado = await treinoService.adicionarPDF(userId, data);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Erro interno ao adicionar PDF",
      });
    }
  }
}