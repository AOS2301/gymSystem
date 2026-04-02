import { prisma } from "../database/prisma.js";

export class TreinoExercicioRepository {
    static async create({ treinoId, exercicioId, series, reps, peso }) {
        return prisma.treinoExercicio.create({
            data: {
                treinoId,
                exercicioId,
                series,
                repeticoes: reps,
                cargaKg: peso,
                descanso,
            }
        });
    }

}