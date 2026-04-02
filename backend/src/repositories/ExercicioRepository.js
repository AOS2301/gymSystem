import { prisma } from "../database/prisma.js";

export class ExercicioRepository {
    static async listarExercicios() {
    return prisma.exercicio.findMany();
  }
}