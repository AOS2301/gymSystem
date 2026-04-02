import { ExercicioRepository } from "../repositories/ExercicioRepository.js";
import { ExercicioDTO } from "../dto/ExercicioDto.js";


export class exeService {
  static async listarExercicios() {
    const exercicios = await ExercicioRepository.listarExercicios();

    return exercicios.map(
      (exercicio) => new ExercicioDTO(exercicio)
    );
  }
}