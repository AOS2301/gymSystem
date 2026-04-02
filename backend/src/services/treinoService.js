import { TreinoRepository } from "../repositories/TreinoRepository.js";
import { TreinoDTO } from "../dto/TreinosDto.js";


export class treinoService {
  static async listarTreinos(userId) {
    const treinos = await TreinoRepository.findByUserId(userId);

    return {
      treinos: treinos.map((treino) => new TreinoDTO(treino)),
    };
  }

  static async incluirTreino(userId, treinoData) {
    const treinos = await TreinoRepository.findByUserIdDiaId(userId, treinoData.diaId);

    if(treinos.length == 0) {
      const inclusaoTreinoDia = await TreinoRepository.create({ ...treinoData.diaId, userId });
    }

    const treino = await TreinoRepository.create({ ...treinoData, userId });

    return {
      treino: new TreinoDTO(treino),
    };
  }

}