-- CreateTable
CREATE TABLE `Sale` (
    `id` VARCHAR(191) NOT NULL,
    `cotizacion_id` VARCHAR(191) NULL,
    `client_id` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `coins_id` INTEGER NULL,
    `sub_total` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(10, 2) NOT NULL,
    `tax_total` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `payment_id` VARCHAR(191) NULL,
    `payment_terms` VARCHAR(191) NULL,
    `due_date` DATETIME(3) NULL,
    `anticipo` DECIMAL(10, 2) NULL,
    `saldo_pendiente` DECIMAL(10, 2) NULL,
    `establishment_id` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `cancel_reason` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saleProduct` (
    `id` VARCHAR(191) NOT NULL,
    `sale_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(10, 2) NOT NULL,
    `tax_rate` DOUBLE NOT NULL,
    `tax_amount` DECIMAL(10, 2) NOT NULL,
    `line_total` DECIMAL(10, 2) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saleService` (
    `id` VARCHAR(191) NOT NULL,
    `sale_id` VARCHAR(191) NOT NULL,
    `service_id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(10, 2) NOT NULL,
    `tax_rate` DOUBLE NOT NULL,
    `tax_amount` DECIMAL(10, 2) NOT NULL,
    `line_total` DECIMAL(10, 2) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaleMenu` (
    `id` VARCHAR(191) NOT NULL,
    `sale_id` VARCHAR(191) NOT NULL,
    `build_your_menu_id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL,
    `line_total` DECIMAL(10, 2) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalePayment` (
    `id` VARCHAR(191) NOT NULL,
    `sale_id` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reference` VARCHAR(191) NULL,
    `coins_id` INTEGER NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `Cotizacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_coins_id_fkey` FOREIGN KEY (`coins_id`) REFERENCES `CoinsCompany`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saleProduct` ADD CONSTRAINT `saleProduct_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `Sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saleProduct` ADD CONSTRAINT `saleProduct_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saleService` ADD CONSTRAINT `saleService_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `Sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saleService` ADD CONSTRAINT `saleService_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleMenu` ADD CONSTRAINT `SaleMenu_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `Sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleMenu` ADD CONSTRAINT `SaleMenu_build_your_menu_id_fkey` FOREIGN KEY (`build_your_menu_id`) REFERENCES `BuildYourMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalePayment` ADD CONSTRAINT `SalePayment_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `Sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalePayment` ADD CONSTRAINT `SalePayment_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalePayment` ADD CONSTRAINT `SalePayment_coins_id_fkey` FOREIGN KEY (`coins_id`) REFERENCES `CoinsCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
