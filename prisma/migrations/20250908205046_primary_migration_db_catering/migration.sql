-- CreateTable
CREATE TABLE `Taxes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TypeCompany` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TypeCompany_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Coins_symbol_key`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payments` (
    `id` VARCHAR(191) NOT NULL,
    `establishment_id` VARCHAR(191) NOT NULL,
    `coins_id` INTEGER NOT NULL DEFAULT 1,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoinsCompany` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `establishment_id` VARCHAR(191) NOT NULL,
    `coins_id` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `companyId` VARCHAR(191) NULL,
    `establishment_id` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `refreshToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Company_identification_key`(`identification`),
    UNIQUE INDEX `Company_bussines_name_key`(`bussines_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Establishment` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` INTEGER NOT NULL,
    `province` INTEGER NOT NULL,
    `district` INTEGER NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `opening_establishment` INTEGER NOT NULL DEFAULT 1,
    `isActive_payment` INTEGER NOT NULL DEFAULT 0,
    `isOnline` INTEGER NOT NULL DEFAULT 1,
    `isService_house` INTEGER NOT NULL DEFAULT 0,
    `banner_path` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Collaborator` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `salary` DECIMAL(10, 2) NOT NULL,
    `emergency_contact` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `specialties` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `user_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Collaborator_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `establishment_id` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

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
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `establishment_id` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `establishment_id` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Provider` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `bussines_name` VARCHAR(191) NOT NULL,
    `identification` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `category_id` VARCHAR(191) NOT NULL,
    `establishment_id` VARCHAR(191) NOT NULL,
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
    `price` DECIMAL(10, 2) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `isGift` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packageServiceGift` (
    `id` VARCHAR(191) NOT NULL,
    `package_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NULL,
    `service_id` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cotizacion` (
    `id` VARCHAR(191) NOT NULL,
    `quantity_person` INTEGER NOT NULL,
    `tentative_date` INTEGER NOT NULL DEFAULT 0,
    `date_event` DATETIME(3) NULL,
    `shift` VARCHAR(191) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `total_igv` DECIMAL(10, 2) NOT NULL,
    `sub_total` DECIMAL(10, 2) NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `package_id` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EstablishmentToProvider` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_EstablishmentToProvider_AB_unique`(`A`, `B`),
    INDEX `_EstablishmentToProvider_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payments` ADD CONSTRAINT `Payments_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payments` ADD CONSTRAINT `Payments_coins_id_fkey` FOREIGN KEY (`coins_id`) REFERENCES `CoinsCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoinsCompany` ADD CONSTRAINT `CoinsCompany_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoinsCompany` ADD CONSTRAINT `CoinsCompany_coins_id_fkey` FOREIGN KEY (`coins_id`) REFERENCES `Coins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_type_company_id_fkey` FOREIGN KEY (`type_company_id`) REFERENCES `TypeCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `Taxes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Establishment` ADD CONSTRAINT `Establishment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collaborator` ADD CONSTRAINT `Collaborator_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `ServiceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceCategory` ADD CONSTRAINT `ServiceCategory_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `ProductCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageService` ADD CONSTRAINT `packageService_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `_EstablishmentToProvider` ADD CONSTRAINT `_EstablishmentToProvider_A_fkey` FOREIGN KEY (`A`) REFERENCES `Establishment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EstablishmentToProvider` ADD CONSTRAINT `_EstablishmentToProvider_B_fkey` FOREIGN KEY (`B`) REFERENCES `Provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
