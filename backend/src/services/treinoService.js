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

    const treinoExercicio = await TreinoExercicioRepository.create({
      treino_id: treino.id,
      exercicio_id: treinoData.exercicioId,
      series: treinoData.series,
      repeticoes: treinoData.repeticoes,
      descanso: treinoData.descanso,
      peso: treinoData.peso,
    });

    return {
      treinoExercicio: new TreinoExercicioDTO(treinoExercicio),
    };
  }

  static async removerTreino(userId, data){
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
}