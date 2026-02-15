/*
  Warnings:

  - The primary key for the `Batch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `year` on the `Batch` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `buildingName` on the `Location` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to drop the column `coordinate` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `upVotes` on the `Memory` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `Memory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `mediaURL` on the `Memory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.
  - The primary key for the `Program` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `name` on the `Program` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - The primary key for the `ProgramBatch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `studentId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `firstName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the `Tags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[year]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[latitude,longitude]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `Batch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `programBatchId` on the `Memory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Program` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ProgramBatch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `programId` on the `ProgramBatch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `batchId` on the `ProgramBatch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `programBatchId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MemoryVisibility" AS ENUM ('PUBLIC', 'PROGRAM_ONLY', 'BATCH_ONLY', 'PRIVATE');

-- DropForeignKey
ALTER TABLE "Memory" DROP CONSTRAINT "Memory_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Memory" DROP CONSTRAINT "Memory_programBatchId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramBatch" DROP CONSTRAINT "ProgramBatch_batchId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramBatch" DROP CONSTRAINT "ProgramBatch_programId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_programBatchId_fkey";

-- DropForeignKey
ALTER TABLE "_MemoryTags" DROP CONSTRAINT "_MemoryTags_B_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "year" SET DATA TYPE SMALLINT,
ADD CONSTRAINT "Batch_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "description" TEXT,
ALTER COLUMN "buildingName" SET DATA TYPE VARCHAR(200);

-- AlterTable
ALTER TABLE "Memory" DROP COLUMN "coordinate",
DROP COLUMN "upVotes",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visibility" "MemoryVisibility" NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "mediaURL" SET DATA TYPE VARCHAR(2048),
DROP COLUMN "programBatchId",
ADD COLUMN     "programBatchId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Program" DROP CONSTRAINT "Program_pkey",
ADD COLUMN     "description" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(200),
ADD CONSTRAINT "Program_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProgramBatch" DROP CONSTRAINT "ProgramBatch_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "programId",
ADD COLUMN     "programId" UUID NOT NULL,
DROP COLUMN "batchId",
ADD COLUMN     "batchId" UUID NOT NULL,
ADD CONSTRAINT "ProgramBatch_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "studentId" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
DROP COLUMN "programBatchId",
ADD COLUMN     "programBatchId" UUID NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'STUDENT',
ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "Tags";

-- CreateTable
CREATE TABLE "MemoryVote" (
    "id" UUID NOT NULL,
    "memoryId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoryVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemoryVote_memoryId_idx" ON "MemoryVote"("memoryId");

-- CreateIndex
CREATE INDEX "MemoryVote_userId_idx" ON "MemoryVote"("userId");

-- CreateIndex
CREATE INDEX "MemoryVote_createdAt_idx" ON "MemoryVote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryVote_memoryId_userId_key" ON "MemoryVote"("memoryId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_year_key" ON "Batch"("year");

-- CreateIndex
CREATE INDEX "Batch_year_idx" ON "Batch"("year");

-- CreateIndex
CREATE INDEX "Location_buildingName_idx" ON "Location"("buildingName");

-- CreateIndex
CREATE UNIQUE INDEX "Location_latitude_longitude_key" ON "Location"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Memory_creatorId_idx" ON "Memory"("creatorId");

-- CreateIndex
CREATE INDEX "Memory_programBatchId_idx" ON "Memory"("programBatchId");

-- CreateIndex
CREATE INDEX "Memory_locationId_idx" ON "Memory"("locationId");

-- CreateIndex
CREATE INDEX "Memory_uploadDate_idx" ON "Memory"("uploadDate");

-- CreateIndex
CREATE INDEX "Memory_visibility_idx" ON "Memory"("visibility");

-- CreateIndex
CREATE INDEX "Memory_isArchived_idx" ON "Memory"("isArchived");

-- CreateIndex
CREATE INDEX "Memory_deletedAt_idx" ON "Memory"("deletedAt");

-- CreateIndex
CREATE INDEX "Memory_createdAt_idx" ON "Memory"("createdAt");

-- CreateIndex
CREATE INDEX "Program_name_idx" ON "Program"("name");

-- CreateIndex
CREATE INDEX "ProgramBatch_programId_idx" ON "ProgramBatch"("programId");

-- CreateIndex
CREATE INDEX "ProgramBatch_batchId_idx" ON "ProgramBatch"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramBatch_programId_batchId_key" ON "ProgramBatch"("programId", "batchId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_studentId_idx" ON "User"("studentId");

-- CreateIndex
CREATE INDEX "User_programBatchId_idx" ON "User"("programBatchId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_firstName_lastName_idx" ON "User"("firstName", "lastName");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_programBatchId_fkey" FOREIGN KEY ("programBatchId") REFERENCES "ProgramBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramBatch" ADD CONSTRAINT "ProgramBatch_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramBatch" ADD CONSTRAINT "ProgramBatch_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_programBatchId_fkey" FOREIGN KEY ("programBatchId") REFERENCES "ProgramBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryVote" ADD CONSTRAINT "MemoryVote_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryVote" ADD CONSTRAINT "MemoryVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemoryTags" ADD CONSTRAINT "_MemoryTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
