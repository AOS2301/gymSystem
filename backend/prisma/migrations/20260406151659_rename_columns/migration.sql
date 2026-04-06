/*
  Warnings:

  - You are about to drop the column `diaSemana` on the `treino` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `treino` table. All the data in the column will be lost.
  - You are about to drop the column `cargaKg` on the `treinoExercicio` table. All the data in the column will be lost.
  - You are about to drop the column `exercicioId` on the `treinoExercicio` table. All the data in the column will be lost.
  - You are about to drop the column `treinoId` on the `treinoExercicio` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[treino_id,exercicio_id]` on the table `treinoExercicio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dia_semana` to the `treino` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `treino` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exercicio_id` to the `treinoExercicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `treino_id` to the `treinoExercicio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "treino" DROP CONSTRAINT "treino_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "treinoExercicio" DROP CONSTRAINT "treinoExercicio_exercicioId_fkey";

-- DropForeignKey
ALTER TABLE "treinoExercicio" DROP CONSTRAINT "treinoExercicio_treinoId_fkey";

-- DropIndex
DROP INDEX "treinoExercicio_treinoId_exercicioId_key";

-- AlterTable
ALTER TABLE "treino" DROP COLUMN "diaSemana",
DROP COLUMN "usuarioId",
ADD COLUMN     "dia_semana" INTEGER NOT NULL,
ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "treinoExercicio" DROP COLUMN "cargaKg",
DROP COLUMN "exercicioId",
DROP COLUMN "treinoId",
ADD COLUMN     "exercicio_id" INTEGER NOT NULL,
ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "treino_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "treinoExercicio_treino_id_exercicio_id_key" ON "treinoExercicio"("treino_id", "exercicio_id");

-- AddForeignKey
ALTER TABLE "treino" ADD CONSTRAINT "treino_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinoExercicio" ADD CONSTRAINT "treinoExercicio_treino_id_fkey" FOREIGN KEY ("treino_id") REFERENCES "treino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinoExercicio" ADD CONSTRAINT "treinoExercicio_exercicio_id_fkey" FOREIGN KEY ("exercicio_id") REFERENCES "exercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
