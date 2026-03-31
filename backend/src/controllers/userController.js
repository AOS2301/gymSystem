import { userService } from "../services/userService.js";

export class userController {
  static async cadastro(req, res) {
    try {
      const { nome, email, senha } = req.body;

      const resultado = await userService.cadastro(nome, email, senha);

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(401).json({
        message: error.message,
      });
    }
  }
}