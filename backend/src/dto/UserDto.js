export class UserDTO {
  constructor(user) {
    this.id = user.id;
    this.nome = user.nome;
    this.email = user.email;
  }
}
