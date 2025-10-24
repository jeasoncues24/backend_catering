/*
  Warnings:

  - You are about to drop the column `price` on the `packageservice` table. All the data in the column will be lost.
  - Added the required column `local_id` to the `packageService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_person` to the `packageService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_package` to the `packageService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `packageservice` DROP COLUMN `price`,
    ADD COLUMN `local_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `price_person` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `quantity_person` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `total_package` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `is_Company` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `label` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ProductService` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuildYourMenu` (
    `id` VARCHAR(191) NOT NULL,
    `type_component_menu_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TypeComponentMenu` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LocalEvent` (
    `id` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `characteristics` JSON NOT NULL,
    `description` VARCHAR(191) NULL,
    `ubication` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `price_aprox` DECIMAL(10, 2) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductService` ADD CONSTRAINT `ProductService_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductService` ADD CONSTRAINT `ProductService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuildYourMenu` ADD CONSTRAINT `BuildYourMenu_type_component_menu_id_fkey` FOREIGN KEY (`type_component_menu_id`) REFERENCES `TypeComponentMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuildYourMenu` ADD CONSTRAINT `BuildYourMenu_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageService` ADD CONSTRAINT `packageService_local_id_fkey` FOREIGN KEY (`local_id`) REFERENCES `LocalEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
