-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Exercise" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Muscle" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "isPrivate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "username" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Workout" ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutDay" ALTER COLUMN "dayIndex" DROP NOT NULL,
ALTER COLUMN "isRest" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutPlan" ALTER COLUMN "isPublic" DROP NOT NULL,
ALTER COLUMN "numDays" DROP NOT NULL;
