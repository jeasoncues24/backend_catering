/*
  Warnings:

  - Added the required column `type` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event` ADD COLUMN `isIgv` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `type` ENUM('SOCIALES', 'CORPORATIVOS') NOT NULL;
