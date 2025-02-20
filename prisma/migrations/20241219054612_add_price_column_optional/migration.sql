/*
  Warnings:

  - You are about to drop the column `reviews` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "reviews",
ADD COLUMN     "price" DOUBLE PRECISION;
