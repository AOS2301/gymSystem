export class TreinoExercicioDTO {
  constructor(te) {
    this.id = te.id;
    this.exercicioId = te.exercicio_id;
    this.series = te.series;
    this.repeticoes_min = te.repeticoes_min;
    this.repeticoes_max = te.repeticoes_max;
    this.peso = te.peso;
    this.descanso = te.descanso;
  }
}