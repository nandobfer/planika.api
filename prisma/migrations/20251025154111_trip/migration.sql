/*
  Warnings:

  - Added the required column `endDate` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Trip` ADD COLUMN `endDate` VARCHAR(191) NOT NULL,
    ADD COLUMN `startDate` VARCHAR(191) NOT NULL;
