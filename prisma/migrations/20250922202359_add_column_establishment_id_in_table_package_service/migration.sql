/*
  Warnings:

  - Added the required column `establishment_id` to the `packageService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `packageservice` ADD COLUMN `establishment_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `packageService` ADD CONSTRAINT `packageService_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
