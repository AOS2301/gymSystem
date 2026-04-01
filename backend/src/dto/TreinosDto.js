export class TreinoDTO {
  constructor(treino) {
    this.id = treino.id;
    this.diaSemana = treino.diaSemana;
    this.exercicios = treino.exercicios.map(e => ({
      id: e.exercicio.id,
      nome: e.exercicio.nome,
      series: e.series,
      repeticoes: e.repeticoes,
      carga: e.cargaKg,
      descanso: e.descanso,
    }));
  }
}
