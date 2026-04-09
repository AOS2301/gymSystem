import { prisma } from "../database/prisma.js";

export class TreinoExercicioRepository {
    static async create({ treino_id, exercicio_id, series, repeticoes, descanso, peso }) {
        try {
            const treinoExercicio = await prisma.treino_exercicio.create({
                data: {
                    treino_id,
                    exercicio_id,
                    series,
                    repeticoes,
                    descanso,
                    peso,
                }
            });
            return treinoExercicio;
        } catch (error) {
            console.error("Erro ao criar treinoExercicio:", error);
            throw error;
        }
    }

    static async findByTreinoId(treinoId) {
        return prisma.treinoExercicio.findMany({
            where: { treino_id: treinoId },
        });
    }


    static async delete(userId, diaId, exercicioId) {
        return prisma.treino_exercicio.deleteMany({
            where: {
                exercicio_id: exercicioId,
                treino: {
                    usuario_id: userId,
                    dia_semana: diaId,
                },
            },
        });
    }
}