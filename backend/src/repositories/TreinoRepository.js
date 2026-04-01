import { prisma } from "../database/prisma.js";

export class TreinoRepository {
  static async findByUserId(userId) {
    return prisma.treino.findMany({
      where: {
        usuarioId: userId,
      },
      include: {
        exercicios: {
          include: {
            exercicio: true,
          },
        },
      },
      orderBy: {
        diaSemana: "asc",
      },
    });
  }
}
