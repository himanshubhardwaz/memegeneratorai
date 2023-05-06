/*
  Warnings:

  - You are about to drop the column `likesCount` on the `Meme` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meme" DROP COLUMN "likesCount";

-- CreateTable
CREATE TABLE "Likes" (
    "id" TEXT NOT NULL,
    "memeId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Likes_id_key" ON "Likes"("id");

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_memeId_fkey" FOREIGN KEY ("memeId") REFERENCES "Meme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
