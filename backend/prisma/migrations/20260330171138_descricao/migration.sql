/*
  Warnings:

  - You are about to drop the `Atividade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Treino` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TreinoAtividade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Treino" DROP CONSTRAINT "Treino_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "TreinoAtividade" DROP CONSTRAINT "TreinoAtividade_atividadeId_fkey";

-- DropForeignKey
ALTER TABLE "TreinoAtividade" DROP CONSTRAINT "TreinoAtividade_treinoId_fkey";

-- DropTable
DROP TABLE "Atividade";

-- DropTable
DROP TABLE "Treino";

-- DropTable
DROP TABLE "TreinoAtividade";

-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treino" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treinoAtividade" (
    "id" SERIAL NOT NULL,
    "treinoId" INTEGER NOT NULL,
    "atividadeId" INTEGER NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" INTEGER NOT NULL,
    "tempoDescansoSegundos" INTEGER NOT NULL,

    CONSTRAINT "treinoAtividade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "treinoAtividade_treinoId_atividadeId_key" ON "treinoAtividade"("treinoId", "atividadeId");

-- AddForeignKey
ALTER TABLE "treino" ADD CONSTRAINT "treino_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinoAtividade" ADD CONSTRAINT "treinoAtividade_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "treino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinoAtividade" ADD CONSTRAINT "treinoAtividade_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
