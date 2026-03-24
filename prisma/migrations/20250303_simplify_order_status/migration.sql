-- Simplify order status: map ACCEPTED, PREPARING, READY -> CONFIRMED
-- Run this before or as part of deploying the new OrderStatus enum.

-- Step 1: Update existing orders to use CONFIRMED (so enum change won't fail)
UPDATE `orders` SET `status` = 'CONFIRMED' WHERE `status` IN ('ACCEPTED', 'PREPARING', 'READY');

-- Step 2: Modify enum to new values (MySQL)
ALTER TABLE `orders` MODIFY COLUMN `status` ENUM('PENDING', 'CONFIRMED', 'PICKED_UP', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';







