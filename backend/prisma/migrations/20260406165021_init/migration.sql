/*
  Warnings:

  - You are about to drop the `exercicio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `treino` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `treinoExercicio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "treino" DROP CONSTRAINT "treino_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "treinoExercicio" DROP CONSTRAINT "treinoExercicio_exercicio_id_fkey";

-- DropForeignKey
ALTER TABLE "treinoExercicio" DROP CONSTRAINT "treinoExercicio_treino_id_fkey";

-- DropTable
DROP TABLE "exercicio";

-- DropTable
DROP TABLE "treino";

-- DropTable
DROP TABLE "treinoExercicio";

-- DropTable
DROP TABLE "usuario";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "grupo_muscular" TEXT,
    "equipamento" TEXT,

    CONSTRAINT "Exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treino" (
    "id" SERIAL NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreinoExercicio" (
    "id" SERIAL NOT NULL,
    "treinoId" INTEGER NOT NULL,
    "exercicioId" INTEGER NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" INTEGER NOT NULL,
    "peso" DOUBLE PRECISION,
    "descanso" INTEGER,

    CONSTRAINT "TreinoExercicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Exercicio_nome_key" ON "Exercicio"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TreinoExercicio_treinoId_exercicioId_key" ON "TreinoExercicio"("treinoId", "exercicioId");

-- AddForeignKey
ALTER TABLE "Treino" ADD CONSTRAINT "Treino_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreinoExercicio" ADD CONSTRAINT "TreinoExercicio_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "Treino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreinoExercicio" ADD CONSTRAINT "TreinoExercicio_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
