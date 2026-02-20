-- Chat Module Database Schema
-- Workspace-level chat with mentions and notifications

-- --------------------------------------------------------
-- Table structure for table `tbl_chat_channels`
-- Workspace-level channels (default: 'general')
-- --------------------------------------------------------

CREATE TABLE `tbl_chat_channels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workspace_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL DEFAULT 'general',
  `description` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_workspace_name` (`workspace_id`, `name`),
  KEY `idx_workspace_id` (`workspace_id`),
  CONSTRAINT `fk_channel_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_channel_creator` FOREIGN KEY (`created_by`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `tbl_chat_messages`
-- Chat messages within channels
-- --------------------------------------------------------

CREATE TABLE `tbl_chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `channel_id` int(11) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_channel_id` (`channel_id`),
  KEY `idx_workspace_id` (`workspace_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_channel_created` (`channel_id`, `created_at`),
  CONSTRAINT `fk_message_channel` FOREIGN KEY (`channel_id`) REFERENCES `tbl_chat_channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `tbl_chat_mentions`
-- Track @username mentions in messages
-- --------------------------------------------------------

CREATE TABLE `tbl_chat_mentions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message_id` int(11) NOT NULL,
  `mentioned_user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_message_user` (`message_id`, `mentioned_user_id`),
  KEY `idx_mentioned_user` (`mentioned_user_id`),
  KEY `idx_message_id` (`message_id`),
  CONSTRAINT `fk_mention_message` FOREIGN KEY (`message_id`) REFERENCES `tbl_chat_messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mention_user` FOREIGN KEY (`mentioned_user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `tbl_notifications`
-- In-app notifications for workspace events and mentions
-- --------------------------------------------------------

CREATE TABLE `tbl_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `workspace_id` int(11) DEFAULT NULL,
  `type` enum('workspace_created','member_added','member_removed','member_updated','message_mention','channel_created') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_user_id` int(11) DEFAULT NULL,
  `related_message_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_workspace_id` (`workspace_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_user_read` (`user_id`, `is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notification_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notification_related_user` FOREIGN KEY (`related_user_id`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notification_message` FOREIGN KEY (`related_message_id`) REFERENCES `tbl_chat_messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `tbl_chat_read_receipts`
-- Track which messages users have read
-- --------------------------------------------------------

CREATE TABLE `tbl_chat_read_receipts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `channel_id` int(11) NOT NULL,
  `last_read_message_id` int(11) DEFAULT NULL,
  `last_read_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_channel` (`user_id`, `channel_id`),
  KEY `idx_channel_id` (`channel_id`),
  CONSTRAINT `fk_read_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_read_channel` FOREIGN KEY (`channel_id`) REFERENCES `tbl_chat_channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_read_message` FOREIGN KEY (`last_read_message_id`) REFERENCES `tbl_chat_messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

