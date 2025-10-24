/*
  Warnings:

  - Added the required column `establishment_id` to the `LocalEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `localevent` ADD COLUMN `establishment_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `LocalEvent` ADD CONSTRAINT `LocalEvent_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
