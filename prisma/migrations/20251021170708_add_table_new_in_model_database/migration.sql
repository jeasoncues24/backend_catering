/*
  Warnings:

  - You are about to drop the column `date_event` on the `cotizacion` table. All the data in the column will be lost.
  - You are about to drop the column `shift` on the `cotizacion` table. All the data in the column will be lost.
  - You are about to drop the column `sub_total` on the `cotizacion` table. All the data in the column will be lost.
  - You are about to drop the column `tentative_date` on the `cotizacion` table. All the data in the column will be lost.
  - You are about to drop the column `total_igv` on the `cotizacion` table. All the data in the column will be lost.
  - Added the required column `establishment_id` to the `Cotizacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `local_event` to the `Cotizacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_person` to the `Cotizacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cotizacion` DROP COLUMN `date_event`,
    DROP COLUMN `shift`,
    DROP COLUMN `sub_total`,
    DROP COLUMN `tentative_date`,
    DROP COLUMN `total_igv`,
    ADD COLUMN `establishment_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `event_time_day` VARCHAR(191) NOT NULL DEFAULT 'dia',
    ADD COLUMN `local_event` VARCHAR(191) NOT NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `price_person` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `type_date_event` VARCHAR(191) NOT NULL DEFAULT 'TENTATIVA';

-- CreateTable
CREATE TABLE `CotizacionProduct` (
    `id` VARCHAR(191) NOT NULL,
    `cotizacion_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CotizacionService` (
    `id` VARCHAR(191) NOT NULL,
    `cotizacion_id` VARCHAR(191) NOT NULL,
    `service_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CotizacionMenu` (
    `id` VARCHAR(191) NOT NULL,
    `cotizacion_id` VARCHAR(191) NOT NULL,
    `build_your_menu_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cotizacion` ADD CONSTRAINT `Cotizacion_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotizacionProduct` ADD CONSTRAINT `CotizacionProduct_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `Cotizacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotizacionProduct` ADD CONSTRAINT `CotizacionProduct_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotizacionService` ADD CONSTRAINT `CotizacionService_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `Cotizacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotizacionService` ADD CONSTRAINT `CotizacionService_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotizacionMenu` ADD CONSTRAINT `CotizacionMenu_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `Cotizacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotizacionMenu` ADD CONSTRAINT `CotizacionMenu_build_your_menu_id_fkey` FOREIGN KEY (`build_your_menu_id`) REFERENCES `BuildYourMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
