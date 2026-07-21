-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "total_modules" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "completed_modules" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "grade" TEXT;
