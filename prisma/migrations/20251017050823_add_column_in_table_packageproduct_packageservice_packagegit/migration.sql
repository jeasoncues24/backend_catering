-- AlterTable
ALTER TABLE `packageforproduct` ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `packageforservice` ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1;
