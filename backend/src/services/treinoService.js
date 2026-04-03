import { TreinoRepository } from "../repositories/TreinoRepository.js";
import { TreinoExercicioRepository } from "../repositories/TreinoExercicioRepository.js";
import { TreinoDTO } from "../dto/TreinosDto.js";


export class treinoService {
  static async listarTreinos(userId) {
    const treinos = await TreinoRepository.findByUserId(userId);

    return {
      treinos: treinos.map((treino) => new TreinoDTO(treino)),
    };
  }


  static async incluirTreino(userId, treinoData) {
    let treino = await TreinoRepository.findOneByUserAndDia(
      userId,
      treinoData.diaId
    );

    if (!treino) {
      treino = await TreinoRepository.create({
        usuarioId : userId,
        diaSemana: treinoData.diaId,
      });
    }

    const treinoExercicio = await TreinoExercicioRepository.create({
      userId,
      treinoId: treino.id,
      exercicioId: treinoData.exercicioId,
      series: treinoData.series,
      reps: treinoData.reps,
      peso: treinoData.peso,
      descanso: treinoData.descanso,
    });

    return {
      treino: new TreinoDTO(treinoExercicio),
    };
  }


}