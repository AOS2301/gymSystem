/*
  Warnings:

  - You are about to drop the column `nome` on the `treino` table. All the data in the column will be lost.
  - You are about to drop the `atividade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `treinoAtividade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "treinoAtividade" DROP CONSTRAINT "treinoAtividade_atividadeId_fkey";

-- DropForeignKey
ALTER TABLE "treinoAtividade" DROP CONSTRAINT "treinoAtividade_treinoId_fkey";

-- AlterTable
ALTER TABLE "treino" DROP COLUMN "nome";

-- DropTable
DROP TABLE "atividade";

-- DropTable
DROP TABLE "treinoAtividade";

-- CreateTable
CREATE TABLE "exercicio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "grupoMuscular" TEXT,
    "equipamento" TEXT,

    CONSTRAINT "exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treinoExercicio" (
    "id" SERIAL NOT NULL,
    "treinoId" INTEGER NOT NULL,
    "exercicioId" INTEGER NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" INTEGER NOT NULL,
    "cargaKg" DOUBLE PRECISION,
    "descanso" INTEGER,

    CONSTRAINT "treinoExercicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercicio_nome_key" ON "exercicio"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "treinoExercicio_treinoId_exercicioId_key" ON "treinoExercicio"("treinoId", "exercicioId");

-- AddForeignKey
ALTER TABLE "treinoExercicio" ADD CONSTRAINT "treinoExercicio_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "treino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinoExercicio" ADD CONSTRAINT "treinoExercicio_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "exercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
