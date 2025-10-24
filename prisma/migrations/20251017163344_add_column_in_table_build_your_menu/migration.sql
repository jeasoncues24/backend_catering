/*
  Warnings:

  - Added the required column `establishmentId` to the `BuildYourMenu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `buildyourmenu` ADD COLUMN `establishmentId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `BuildYourMenu` ADD CONSTRAINT `BuildYourMenu_establishmentId_fkey` FOREIGN KEY (`establishmentId`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
