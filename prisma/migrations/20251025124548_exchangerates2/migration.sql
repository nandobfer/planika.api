/*
  Warnings:

  - You are about to drop the `CurrencySymbols` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExchangeRates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `CurrencySymbols`;

-- DropTable
DROP TABLE `ExchangeRates`;

-- CreateTable
CREATE TABLE `CurrencySymbol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `updatedAt` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CurrencySymbol_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExchangeRate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `base` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL,
    `updatedAt` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ExchangeRate_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
