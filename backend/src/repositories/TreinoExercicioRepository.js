import { prisma } from "../database/prisma.js";

export class TreinoExercicioRepository {
    static async create({ treino_id, exercicio_id, series, reps, descanso, peso }) {
        return prisma.treinoExercicio.create({
            data: {
                treino_id,
                exercicio_id,
                series,
                repeticoes: reps,
                descanso,
                peso,
            }
        });
    }
}