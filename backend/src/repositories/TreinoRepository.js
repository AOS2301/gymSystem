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

  static async findByUserIdDiaId(userId, diaId) {
    return prisma.treino.findMany({
      where: {
        usuarioId: userId,
        diaId: diaId,
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

  static async create({ diaId, userId }) {
    const treino = await prisma.treino.create({
      data: {
        diaId,
        userId
      },
    });

    return treino;
  }
}
