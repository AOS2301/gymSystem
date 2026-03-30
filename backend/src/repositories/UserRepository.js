
import { prisma } from "../database/prisma.js";

export class UserRepository {
  static async findByEmail(email) {
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    return user;
  }

  static async create({ nome, email, senha }) {
    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha,
      },
    });

    return user;
  }
}
