export class TreinoExercicioDTO {
  constructor(te) {
    this.id = te.id;
    this.exercicioId = te.exercicio_id;
    this.series = te.series;
    this.repeticoes = te.repeticoes;
    this.peso = te.peso;
    this.descanso = te.descanso;
  }
}