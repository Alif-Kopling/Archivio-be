-- AlterTable
ALTER TABLE `Document`
    ADD COLUMN `sender` VARCHAR(191) NULL,
    ADD COLUMN `documentDate` DATETIME(3) NULL;
