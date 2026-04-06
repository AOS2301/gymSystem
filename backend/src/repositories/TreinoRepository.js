import { prisma } from "../database/prisma.js";

export class TreinoRepository {
  static async findByUserId(userId) {
    return prisma.treino.findMany({
      where: {
        usuario_id: Number(userId),
      },
      include: {
        exercicios: {
          include: {
            exercicio: true,
          },
        },
      },
      orderBy: {
        dia_semana: "asc",
      },
    });
  }

  static async findByUserIdDiaId(userId, diaId) {
    try {
      const treino = await prisma.treino.findFirst({
        where: {
          usuario_id: Number(userId),
          dia_semana: Number(diaId),
        },
      });
      return treino;
    } catch (error) {
      console.error("Erro ao buscar treino:", error);
      throw error;
    }
  }


  static async create({ usuario_id, dia_semana }) {
    try {
      const treino = await prisma.treino.create({
        data: {
          usuario_id,
          dia_semana,
        },
      });
      return treino;
    } catch (error) {
      console.error("Erro ao criar treino:", error);
      throw error;
    }
  }
}
