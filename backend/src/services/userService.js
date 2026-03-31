import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserDTO } from "../dto/UserDto.js";


export class userService {
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