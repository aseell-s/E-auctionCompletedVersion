/*
  Warnings:

  - You are about to drop the column `panNo` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "panNo",
DROP COLUMN "taxId";
