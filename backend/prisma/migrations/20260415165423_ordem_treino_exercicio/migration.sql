/*
  Warnings:

  - Added the required column `ordem` to the `treino_exercicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "treino_exercicio" ADD COLUMN     "ordem" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "treino_exercicio_treino_id_ordem_idx" ON "treino_exercicio"("treino_id", "ordem");
