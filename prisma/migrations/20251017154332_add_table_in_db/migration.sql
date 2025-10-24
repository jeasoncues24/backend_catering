/*
  Warnings:

  - Added the required column `structureMenuId` to the `BuildYourMenu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishmentId` to the `TypeComponentMenu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `buildyourmenu` ADD COLUMN `structureMenuId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `typecomponentmenu` ADD COLUMN `establishmentId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `StructureMenu` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `establishment_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StructureMenu` ADD CONSTRAINT `StructureMenu_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuildYourMenu` ADD CONSTRAINT `BuildYourMenu_structureMenuId_fkey` FOREIGN KEY (`structureMenuId`) REFERENCES `StructureMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TypeComponentMenu` ADD CONSTRAINT `TypeComponentMenu_establishmentId_fkey` FOREIGN KEY (`establishmentId`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
