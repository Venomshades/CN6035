-- ------------------------------------------------------------
-- 1. Create the database (if it doesn’t already exist)
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `restaurant`;
USE `restaurant`;

-- ------------------------------------------------------------
-- 2. Create the `users` table
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  `phone` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Create the `restaurants` table
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE `restaurants` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_restaurants_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Create the `reservations` table
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `reservation_time` DATETIME NOT NULL,
  `party_size` INT UNSIGNED NOT NULL DEFAULT 1,
  `status` ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reservations_user` (`user_id`),
  INDEX `idx_reservations_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_reservations_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reservations_restaurant` FOREIGN KEY (`restaurant_id`)
    REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `phone`)
VALUES
  ('Administrator', 'admin@admin.com', '<hashed_admin_password>', 'admin', NULL);

INSERT INTO `restaurants` (`name`, `location`)
VALUES
  ('The Greek Tavern', 'Athens, Greece'),
  ('Sushi Paradise', 'Tokyo, Japan'),
  ('La Pizzeria', 'Naples, Italy');

ALTER DATABASE `restaurant`
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;