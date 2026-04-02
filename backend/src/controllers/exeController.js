import { exeService } from "../services/exeService.js";

export class exeController {
  static async listarExercicios(req, res) {
    try {
      const resultado = await exeService.listarExercicios();

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno ao buscar exercícios",
      });
    }
  }
}