/*
  Warnings:

  - You are about to drop the column `name` on the `Exercise` table. All the data in the column will be lost.
  - Added the required column `exerciseTemplateId` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Exercise_workoutId_idx";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "name",
ADD COLUMN     "exerciseTemplateId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ExerciseTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "equipment" TEXT,
    "difficulty" TEXT,

    CONSTRAINT "ExerciseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuscleExerciseTemplate" (
    "muscleId" INTEGER NOT NULL,
    "exerciseTemplateId" INTEGER NOT NULL,

    CONSTRAINT "MuscleExerciseTemplate_pkey" PRIMARY KEY ("muscleId","exerciseTemplateId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseTemplate_name_key" ON "ExerciseTemplate"("name");

-- AddForeignKey
ALTER TABLE "MuscleExerciseTemplate" ADD CONSTRAINT "MuscleExerciseTemplate_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscleExerciseTemplate" ADD CONSTRAINT "MuscleExerciseTemplate_exerciseTemplateId_fkey" FOREIGN KEY ("exerciseTemplateId") REFERENCES "ExerciseTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_exerciseTemplateId_fkey" FOREIGN KEY ("exerciseTemplateId") REFERENCES "ExerciseTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
