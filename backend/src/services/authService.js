import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserDTO } from "../dto/UserDto.js";

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
      user: new UserDTO(user),
    };
  }


  static async cadastro(nome, email, senha) {
    // 1. Verifica se já existe
    const userExiste = await UserRepository.findByEmail(email);

    if (userExiste) {
      throw new Error("Usuário já cadastrado");
    }

    // 2. Criptografa a senha
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // 3. Cria usuário no banco
    const novoUser = await UserRepository.create({
      nome,
      email,
      senha: senhaHash,
    });

    // 4. Retorna DTO (SEM senha)
    return {
      user: new UserDTO(novoUser),
    };
  }

}
