/*
  Warnings:

  - You are about to drop the `Exercicio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Treino` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TreinoExercicio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Treino" DROP CONSTRAINT "Treino_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "TreinoExercicio" DROP CONSTRAINT "TreinoExercicio_exercicioId_fkey";

-- DropForeignKey
ALTER TABLE "TreinoExercicio" DROP CONSTRAINT "TreinoExercicio_treinoId_fkey";

-- DropTable
DROP TABLE "Exercicio";

-- DropTable
DROP TABLE "Treino";

-- DropTable
DROP TABLE "TreinoExercicio";

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
CREATE TABLE "exercicio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "grupo_muscular" TEXT,
    "equipamento" TEXT,

    CONSTRAINT "exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treino" (
    "id" SERIAL NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treino_exercicio" (
    "id" SERIAL NOT NULL,
    "treino_id" INTEGER NOT NULL,
    "exercicio_id" INTEGER NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" INTEGER NOT NULL,
    "peso" DOUBLE PRECISION,
    "descanso" INTEGER,

    CONSTRAINT "treino_exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exercicio_nome_key" ON "exercicio"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "treino_exercicio_treino_id_exercicio_id_key" ON "treino_exercicio"("treino_id", "exercicio_id");

-- AddForeignKey
ALTER TABLE "treino" ADD CONSTRAINT "treino_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treino_exercicio" ADD CONSTRAINT "treino_exercicio_treino_id_fkey" FOREIGN KEY ("treino_id") REFERENCES "treino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treino_exercicio" ADD CONSTRAINT "treino_exercicio_exercicio_id_fkey" FOREIGN KEY ("exercicio_id") REFERENCES "exercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
