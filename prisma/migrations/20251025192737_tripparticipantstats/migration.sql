-- DropForeignKey
ALTER TABLE `TripParticipant` DROP FOREIGN KEY `TripParticipant_userId_fkey`;

-- AlterTable
ALTER TABLE `TripParticipant` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `TripParticipant` ADD CONSTRAINT `TripParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
