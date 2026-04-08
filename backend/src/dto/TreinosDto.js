export class TreinoDTO {
  constructor(treino) {
    this.id = treino.id;
    this.diaSemana = treino.dia_semana;

    this.exercicios = treino.exercicios.map((te) => ({
      id: te.id,
      exercicioId: te.exercicio_id,
      nome: te.exercicio.nome,
      series: te.series,
      repeticoes: te.repeticoes,
      peso: te.peso,
      descanso: te.descanso,
    }));
  }
}