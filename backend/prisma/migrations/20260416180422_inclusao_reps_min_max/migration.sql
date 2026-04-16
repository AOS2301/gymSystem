/*
  Warnings:

  - You are about to drop the column `repeticoes` on the `treino_exercicio` table. All the data in the column will be lost.
  - Added the required column `repeticoes_max` to the `treino_exercicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repeticoes_min` to the `treino_exercicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "treino_exercicio" DROP COLUMN "repeticoes",
ADD COLUMN     "repeticoes_max" INTEGER NOT NULL,
ADD COLUMN     "repeticoes_min" INTEGER NOT NULL;
