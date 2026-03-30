export class UserRepository {
  static async findByEmail(email) {
    // Simulação de banco
    const users = [
      {
        id: 1,
        nome: "Arthur",
        email: "arthur@email.com",
        senha: "123456",
      },
    ];

    return users.find(user => user.email === email);
  }

  static async findByEmail(email) {
    // Simulação de banco
    const users = [
      {
        id: 1,
        nome: "Arthur",
        email: "arthur@email.com",
        senha: "123456",
      },
    ];

    return users.find(user => user.email === email);
  }
}
