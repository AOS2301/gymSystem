import { TreinoRepository } from "../repositories/TreinoRepository.js";
import { TreinoExercicioRepository } from "../repositories/TreinoExercicioRepository.js";
import { TreinoDTO } from "../dto/TreinosDto.js";
import { TreinoExercicioDTO } from "../dto/TreinoExercicioDto.js";


export class treinoService {
  static async listarTreinos(userId) {
    const treinos = await TreinoRepository.findByUserId(userId);

    return {
      treinos: treinos.map((treino) => new TreinoDTO(treino)),
    };
  }

  static async incluirTreino(userId, treinoData) {
    let treino = await TreinoRepository.findByUserIdDiaId(
      userId,
      treinoData.diaId
    );

    if (!treino) {
      treino = await TreinoRepository.create({
        usuario_id: userId,
        dia_semana: treinoData.diaId,
      });
    }

    const ultimaOrdem =
      await TreinoExercicioRepository.getMaiorOrdemByTreinoId(treino.id);

    const novaOrdem =
      ultimaOrdem !== null && ultimaOrdem !== undefined
        ? ultimaOrdem + 1
        : 0;

    const treinoExercicio = await TreinoExercicioRepository.create({
      treino_id: treino.id,
      exercicio_id: treinoData.exercicioId,
      series: treinoData.series,
      repeticoes_min: treinoData.repeticoes_min,
      repeticoes_max: treinoData.repeticoes_max,
      descanso: treinoData.descanso,
      peso: treinoData.peso,
      ordem: novaOrdem
    });

    return {
      treinoExercicio: new TreinoExercicioDTO(treinoExercicio),
    };
  }

  static async removerTreino(userId, data) {
    const result = await TreinoExercicioRepository.delete(
      userId,
      data.diaId,
      data.exercicioId
    );

    if (result.count === 0) {
      throw new Error("Exercício não encontrado para este dia");
    }

    return { success: true };
  }

  static async atualizarTreino(treinoId, data) {
    try {
      const result = await TreinoExercicioRepository.update(
        treinoId,
        data
      );

      return { success: true };

    } catch (error) {
      throw new Error("Falha ao atualizar treino: " + error.message);
    }

  }

  static async reordenarTreinos(userId, diaId, exercicios) {
    if (!Array.isArray(exercicios)) {
      throw new Error("Lista de exercícios inválida");
    }

    const treino = await TreinoRepository.findByUserIdDiaId(
      userId,
      diaId
    );

    if (!treino) {
      throw new Error("Treino não encontrado");
    }

    const exerciciosDoTreino =
      await TreinoExercicioRepository.findIdsByTreinoId(treino.id);

    const exerciciosIdsValidos = new Set(
      exerciciosDoTreino.map(e => e.id)
    );

    for (const { treinoExercicioId } of exercicios) {
      if (!exerciciosIdsValidos.has(treinoExercicioId)) {
        throw new Error(
          `Exercício ${treinoExercicioId} não pertence ao treino`
        );
      }
    }

    await TreinoExercicioRepository.updateOrdemEmLote(exercicios);

    return { success: true };
  }
}