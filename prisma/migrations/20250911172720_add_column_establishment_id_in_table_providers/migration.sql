/*
  Warnings:

  - You are about to drop the `_establishmenttoprovider` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `establishment_id` to the `Provider` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_establishmenttoprovider` DROP FOREIGN KEY `_EstablishmentToProvider_A_fkey`;

-- DropForeignKey
ALTER TABLE `_establishmenttoprovider` DROP FOREIGN KEY `_EstablishmentToProvider_B_fkey`;

-- AlterTable
ALTER TABLE `provider` ADD COLUMN `establishment_id` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_establishmenttoprovider`;

-- AddForeignKey
ALTER TABLE `Provider` ADD CONSTRAINT `Provider_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
