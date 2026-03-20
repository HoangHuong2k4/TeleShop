-- AlterTable
ALTER TABLE `Order` ADD COLUMN `botUserId` INTEGER NULL;

-- CreateTable
CREATE TABLE `BotUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teleId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `botId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BotUser_teleId_botId_key`(`teleId`, `botId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BotUser` ADD CONSTRAINT `BotUser_botId_fkey` FOREIGN KEY (`botId`) REFERENCES `BotConfig`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_botUserId_fkey` FOREIGN KEY (`botUserId`) REFERENCES `BotUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
