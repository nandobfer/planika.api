/*
  Warnings:

  - You are about to drop the `CurrencySymbol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExchangeRate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `CurrencySymbol`;

-- DropTable
DROP TABLE `ExchangeRate`;

-- CreateTable
CREATE TABLE `CurrencyRate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `updatedAt` VARCHAR(191) NOT NULL,
    `base` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL,

    UNIQUE INDEX `CurrencyRate_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
