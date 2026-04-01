import { PrismaClient } from "@prisma/client";
import exercicios from "./exercises-ptbr-minimal.json" assert { type: "json" };

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Importando exercícios em português...");

  for (const ex of exercicios) {
    await prisma.exercicio.create({
      data: {
        nome: ex.name,
        descricao: ex.instructions.join(" "),
      },
    });
  }

  console.log("✅ Exercícios importados com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
