/*
  Warnings:

  - You are about to drop the `company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cotizacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `packageforproduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `packageforservice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `packageservice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `typecomponentmenu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `company` DROP FOREIGN KEY `Company_tax_id_fkey`;

-- DropForeignKey
ALTER TABLE `company` DROP FOREIGN KEY `Company_type_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `cotizacion` DROP FOREIGN KEY `Cotizacion_client_id_fkey`;

-- DropForeignKey
ALTER TABLE `cotizacion` DROP FOREIGN KEY `Cotizacion_establishment_id_fkey`;

-- DropForeignKey
ALTER TABLE `packageservice` DROP FOREIGN KEY `packageService_establishment_id_fkey`;

-- DropForeignKey
ALTER TABLE `packageservice` DROP FOREIGN KEY `packageService_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `packageservice` DROP FOREIGN KEY `packageService_local_id_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_establishment_id_fkey`;

-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_establishment_id_fkey`;

-- DropForeignKey
ALTER TABLE `typecomponentmenu` DROP FOREIGN KEY `TypeComponentMenu_establishmentId_fkey`;

-- DropIndex
DROP INDEX `BuildYourMenu_product_id_fkey` ON `BuildYourMenu`;

-- DropIndex
DROP INDEX `BuildYourMenu_type_component_menu_id_fkey` ON `BuildYourMenu`;

-- DropIndex
DROP INDEX `CotizacionMenu_cotizacion_id_fkey` ON `CotizacionMenu`;

-- DropIndex
DROP INDEX `CotizacionProduct_cotizacion_id_fkey` ON `CotizacionProduct`;

-- DropIndex
DROP INDEX `CotizacionProduct_product_id_fkey` ON `CotizacionProduct`;

-- DropIndex
DROP INDEX `CotizacionService_cotizacion_id_fkey` ON `CotizacionService`;

-- DropIndex
DROP INDEX `CotizacionService_service_id_fkey` ON `CotizacionService`;

-- DropIndex
DROP INDEX `Establishment_companyId_fkey` ON `Establishment`;

-- DropIndex
DROP INDEX `ProductService_productId_fkey` ON `ProductService`;

-- DropIndex
DROP INDEX `ProductService_serviceId_fkey` ON `ProductService`;

-- DropIndex
DROP INDEX `Sale_cotizacion_id_fkey` ON `Sale`;

-- DropIndex
DROP INDEX `User_companyId_fkey` ON `User`;

-- DropIndex
DROP INDEX `packageServiceGift_package_id_fkey` ON `packageServiceGift`;

-- DropIndex
DROP INDEX `packageServiceGift_product_id_fkey` ON `packageServiceGift`;

-- DropIndex
DROP INDEX `packageServiceGift_service_id_fkey` ON `packageServiceGift`;

-- DropIndex
DROP INDEX `saleProduct_product_id_fkey` ON `saleProduct`;

-- DropIndex
DROP INDEX `saleService_service_id_fkey` ON `saleService`;

-- DropTable
DROP TABLE `company`;

-- DropTable
DROP TABLE `cotizacion`;

-- DropTable
DROP TABLE `packageforproduct`;

-- DropTable
DROP TABLE `packageforservice`;

-- DropTable
DROP TABLE `packageservice`;

-- DropTable
DROP TABLE `product`;

-- DropTable
DROP TABLE `service`;

-- DropTable
DROP TABLE `typecomponentmenu`;

-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `identification` VARCHAR(191) NOT NULL,
    `bussines_name` VARCHAR(191) NOT NULL,
    `type_company_id` INTEGER NOT NULL,
    `trade_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `color_primary` VARCHAR(191) NOT NULL DEFAULT '#000000',
    `status` INTEGER NOT NULL DEFAULT 1,
    `tax_id` INTEGER NOT NULL,
    `logo_path` VARCHAR(191) NULL,
    `logo_ticket` INTEGER NOT NULL DEFAULT 0,
    `isReturnMoney` INTEGER NOT NULL DEFAULT 0,
    `isEventSocials` INTEGER NOT NULL DEFAULT 0,
    `isEventCorporate` INTEGER NOT NULL DEFAULT 0,
    `isPolityPayment` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Company_identification_key`(`identification`),
    UNIQUE INDEX `Company_bussines_name_key`(`bussines_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `duration` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `establishment_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `isProducts` INTEGER NOT NULL DEFAULT 0,
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
    `price` DECIMAL(10, 2) NOT NULL,
    `establishmentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `is_Company` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `category_id` VARCHAR(191) NOT NULL,
    `establishment_id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packageService` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity_person` INTEGER NOT NULL DEFAULT 1,
    `price_person` DECIMAL(10, 2) NOT NULL,
    `total_package` DECIMAL(10, 2) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `local_id` VARCHAR(191) NOT NULL,
    `isGift` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `isDetail` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `establishment_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packageForService` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packageForProduct` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cotizacion` (
    `id` VARCHAR(191) NOT NULL,
    `package_id` VARCHAR(191) NOT NULL,
    `event_date` VARCHAR(191) NULL,
    `type_date_event` VARCHAR(191) NOT NULL DEFAULT 'TENTATIVA',
    `event_time_day` VARCHAR(191) NOT NULL DEFAULT 'dia',
    `establishment_id` VARCHAR(191) NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `quantity_person` INTEGER NOT NULL,
    `price_person` DECIMAL(10, 2) NOT NULL,
    `local_event` VARCHAR(191) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_type_company_id_fkey` FOREIGN KEY (`type_company_id`) REFERENCES `TypeCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `Taxes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Establishment` ADD CONSTRAINT `Establishment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `ServiceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductService` ADD CONSTRAINT `ProductService_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductService` ADD CONSTRAINT `ProductService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuildYourMenu` ADD CONSTRAINT `BuildYourMenu_type_component_menu_id_fkey` FOREIGN KEY (`type_component_menu_id`) REFERENCES `TypeComponentMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuildYourMenu` ADD CONSTRAINT `BuildYourMenu_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TypeComponentMenu` ADD CONSTRAINT `TypeComponentMenu_establishmentId_fkey` FOREIGN KEY (`establishmentId`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `ProductCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageService` ADD CONSTRAINT `packageService_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageService` ADD CONSTRAINT `packageService_local_id_fkey` FOREIGN KEY (`local_id`) REFERENCES `LocalEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageService` ADD CONSTRAINT `packageService_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageForService` ADD CONSTRAINT `packageForService_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packageService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageForService` ADD CONSTRAINT `packageForService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageForProduct` ADD CONSTRAINT `packageForProduct_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packageService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageForProduct` ADD CONSTRAINT `packageForProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageServiceGift` ADD CONSTRAINT `packageServiceGift_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packageService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageServiceGift` ADD CONSTRAINT `packageServiceGift_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageServiceGift` ADD CONSTRAINT `packageServiceGift_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cotizacion` ADD CONSTRAINT `Cotizacion_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cotizacion` ADD CONSTRAINT `Cotizacion_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packageService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `Cotizacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saleProduct` ADD CONSTRAINT `saleProduct_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saleService` ADD CONSTRAINT `saleService_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
