-- CreateTable
CREATE TABLE `CurrencySymbols` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `updatedAt` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CurrencySymbols_symbol_key`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExchangeRates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `base` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL,
    `updatedAt` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ExchangeRates_symbol_key`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
