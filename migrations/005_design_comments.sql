CREATE TABLE `design_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `design_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `design_id` (`design_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `design_comments_ibfk_1` FOREIGN KEY (`design_id`) REFERENCES `car_designs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `design_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
