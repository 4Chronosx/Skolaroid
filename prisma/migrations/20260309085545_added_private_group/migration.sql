-- AlterEnum
ALTER TYPE "MemoryVisibility" ADD VALUE 'GROUP_ONLY';

-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "privateGroupId" UUID;

-- CreateTable
CREATE TABLE "PrivateGroup" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "creatorId" UUID,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupMembers" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_GroupMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrivateGroup_name_key" ON "PrivateGroup"("name");

-- CreateIndex
CREATE INDEX "PrivateGroup_name_idx" ON "PrivateGroup"("name");

-- CreateIndex
CREATE INDEX "PrivateGroup_creatorId_idx" ON "PrivateGroup"("creatorId");

-- CreateIndex
CREATE INDEX "PrivateGroup_deletedAt_idx" ON "PrivateGroup"("deletedAt");

-- CreateIndex
CREATE INDEX "_GroupMembers_B_index" ON "_GroupMembers"("B");

-- CreateIndex
CREATE INDEX "Memory_privateGroupId_idx" ON "Memory"("privateGroupId");

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_privateGroupId_fkey" FOREIGN KEY ("privateGroupId") REFERENCES "PrivateGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateGroup" ADD CONSTRAINT "PrivateGroup_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMembers" ADD CONSTRAINT "_GroupMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "PrivateGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMembers" ADD CONSTRAINT "_GroupMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
