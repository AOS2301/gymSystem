import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exercicios = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "exercises-ptbr-minimal.json"),
    "utf-8"
  )
);

async function main() {
  console.log("🌱 Importando exercícios em português...");

  for (const ex of exercicios) {
    await prisma.exercicio.create({
      data: {
        nome: ex.name,
        descricao: Array.isArray(ex.instructions)
          ? ex.instructions.join(" ")
          : ex.instructions ?? "",
      },
    });
  }

  console.log("✅ Exercícios importados com sucesso!");
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());