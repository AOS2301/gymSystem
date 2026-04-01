import { TreinoRepository } from "../repositories/TreinoRepository.js";
import { TreinoDTO } from "../dto/TreinosDto.js";


export class execService {
  static async treinos(userId) {
    const treinos = await TreinoRepository.findByUserId(userId);

    return {
      treinos: treinos.map((treino) => new TreinoDTO(treino)),
    };
  }

}