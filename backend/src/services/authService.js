
import { UserRepository } from "../repositories/UserRepository.js";

export class AuthService {
  static async login(email, senha) {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (user.senha !== senha) {
      throw new Error("Senha inválida");
    }

    // Exemplo simples (sem JWT ainda)
    return {
      token: "token-exemplo-123",
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
    };
  }
}
