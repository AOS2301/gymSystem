import { prisma } from "../database/prisma.js";

export class TreinoExercicioRepository {

    static async getMaiorOrdemByTreinoId(treinoId) {
        const result = await prisma.treino_exercicio.aggregate({
            where: { treino_id: treinoId },
            _max: { ordem: true },
        });

        return result._max.ordem;
    }

    static async findIdsByTreinoId(treinoId) {
        return prisma.treino_exercicio.findMany({
            where: { treino_id: treinoId },
            select: { id: true }
        });
    }

    static async create({ treino_id, exercicio_id, series, repeticoes, descanso, peso, ordem }) {
        try {
            const treinoExercicio = await prisma.treino_exercicio.create({
                data: {
                    treino_id,
                    exercicio_id,
                    series,
                    repeticoes,
                    descanso,
                    peso,
                    ordem,
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

    static async update(treinoId, data) {
        return prisma.treino_exercicio.update({
            where: {
                id: treinoId
            },
            data: data
        });
    }

    static async updateOrdemEmLote(exercicios) {
        return prisma.$transaction(
            exercicios.map(e =>
                prisma.treino_exercicio.update({
                    where: { id: e.treinoExercicioId },
                    data: { ordem: e.ordem }
                })
            )
        );
    }

}