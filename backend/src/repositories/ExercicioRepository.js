import { prisma } from "../database/prisma.js";

export class ExercicioRepository {
  static async listarExercicios() {
    return prisma.exercicio.findMany();
  }

  // Busca exercício pelo nome (case-insensitive)
  static async findByNome(nome) {
    return prisma.exercicio.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: "insensitive",
        },
      },
    });
  }

  // Cria exercício caso não exista no catálogo
  static async create(nome) {
    return prisma.exercicio.create({
      data: { nome },
    });
  }
}