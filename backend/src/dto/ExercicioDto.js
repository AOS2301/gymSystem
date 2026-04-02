export class ExercicioDTO {
  constructor({ id, nome, descricao, grupoMuscular, equipamento }) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.grupoMuscular = grupoMuscular;
    this.equipamento = equipamento;
  }
}