-- CreateTable
CREATE TABLE `packageForService` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
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
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `packageForService` ADD CONSTRAINT `packageForService_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packageService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageForService` ADD CONSTRAINT `packageForService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageForProduct` ADD CONSTRAINT `packageForProduct_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packageService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packageForProduct` ADD CONSTRAINT `packageForProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
