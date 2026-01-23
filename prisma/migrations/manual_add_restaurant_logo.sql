-- Migration: Add logo field to restaurants table
-- Run this SQL manually on your database

ALTER TABLE `restaurants` ADD COLUMN `logo` VARCHAR(191) NULL AFTER `image`;
