/*
  Warnings:

  - Added the required column `createdAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdAt` VARCHAR(191) NOT NULL,
    ADD COLUMN `defaultCurrency` VARCHAR(191) NOT NULL DEFAULT 'BRL';
