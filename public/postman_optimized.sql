-- phpMyAdmin SQL Dump - OPTIMIZED VERSION
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Dec 06, 2025 at 10:39 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12
--
-- OPTIMIZATIONS:
-- 1. Added composite indexes for common query patterns
-- 2. Added missing foreign key constraints
-- 3. Added indexes on frequently queried columns
-- 4. Optimized for JOIN operations and WHERE clauses

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `postman`
--

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_active_environments`
--

CREATE TABLE `tbl_active_environments` (
  `id` int(11) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `environment_id` int(11) DEFAULT NULL,
  `set_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_api_requests`
--

CREATE TABLE `tbl_api_requests` (
  `id` int(11) NOT NULL,
  `collection_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `method` enum('GET','POST','PUT','DELETE','PATCH','OPTIONS') DEFAULT NULL,
  `url` text DEFAULT NULL,
  `body_raw` text DEFAULT NULL,
  `body_formdata` text DEFAULT NULL,
  `queryParams` text DEFAULT NULL,
  `response` text DEFAULT NULL,
  `response_code` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `folder_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_api_requests_draft`
--

CREATE TABLE `tbl_api_requests_draft` (
  `id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `method` enum('GET','POST','PUT','DELETE','PATCH','OPTIONS') DEFAULT NULL,
  `url` text DEFAULT NULL,
  `body_raw` text DEFAULT NULL,
  `body_formdata` text DEFAULT NULL,
  `queryParams` text DEFAULT NULL,
  `response` text DEFAULT NULL,
  `response_code` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_collections`
--

CREATE TABLE `tbl_collections` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `workspace_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_environments`
--

CREATE TABLE `tbl_environments` (
  `id` int(11) NOT NULL,
  `workspace_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_environment_variables`
--

CREATE TABLE `tbl_environment_variables` (
  `id` int(11) NOT NULL,
  `environment_id` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `type` enum('default','secret') DEFAULT 'default'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_global_variables`
--

CREATE TABLE `tbl_global_variables` (
  `id` int(11) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `type` enum('default','secret') DEFAULT 'default'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_request_folders`
--

CREATE TABLE `tbl_request_folders` (
  `id` int(11) NOT NULL,
  `collection_id` int(11) DEFAULT NULL,
  `parent_folder_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_request_headers`
--

CREATE TABLE `tbl_request_headers` (
  `id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `header_key` varchar(255) DEFAULT NULL,
  `header_value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_request_history`
--

CREATE TABLE `tbl_request_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `request_id` int(11) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `response` text DEFAULT NULL,
  `status_code` int(11) DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_workspaces`
--

CREATE TABLE `tbl_workspaces` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_default_wks` enum('0','1') NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_workspace_members`
--

CREATE TABLE `tbl_workspace_members` (
  `id` int(11) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('OWNER','EDITOR','VIEWER') DEFAULT 'VIEWER',
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_expires` (`expires`); -- Added for session cleanup queries

--
-- Indexes for table `tbl_active_environments`
--
ALTER TABLE `tbl_active_environments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_workspace` (`workspace_id`,`user_id`),
  ADD KEY `fk_active_env` (`environment_id`),
  ADD KEY `fk_active_env_user` (`user_id`),
  ADD KEY `idx_workspace_user` (`workspace_id`,`user_id`); -- Composite index for faster lookups

--
-- Indexes for table `tbl_api_requests`
--
ALTER TABLE `tbl_api_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_collection_id` (`collection_id`),
  ADD KEY `idx_folder_id` (`folder_id`),
  ADD KEY `idx_collection_folder` (`collection_id`,`folder_id`), -- Composite for folder queries
  ADD KEY `idx_user_collection` (`user_id`,`collection_id`), -- Composite for user collection queries
  ADD KEY `idx_created_at` (`created_at`), -- For sorting by creation date
  ADD KEY `idx_updated_at` (`updated_at`); -- For sorting by update date

--
-- Indexes for table `tbl_api_requests_draft`
--
ALTER TABLE `tbl_api_requests_draft`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_draft_user_request` (`request_id`,`user_id`),
  ADD KEY `idx_user_id` (`user_id`), -- Added for user-specific draft queries
  ADD KEY `idx_request_id` (`request_id`); -- Added for request-specific queries

--
-- Indexes for table `tbl_collections`
--
ALTER TABLE `tbl_collections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_workspace_id` (`workspace_id`),
  ADD KEY `idx_workspace_user` (`workspace_id`,`user_id`), -- Composite for workspace user queries
  ADD KEY `idx_created_at` (`created_at`); -- For sorting collections

--
-- Indexes for table `tbl_environments`
--
ALTER TABLE `tbl_environments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_workspace_id` (`workspace_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_workspace_user` (`workspace_id`,`user_id`), -- Composite for workspace user queries
  ADD KEY `idx_created_at` (`created_at`); -- For sorting environments

--
-- Indexes for table `tbl_environment_variables`
--
ALTER TABLE `tbl_environment_variables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_environment_id` (`environment_id`),
  ADD KEY `idx_key` (`key`); -- Added for key lookups

--
-- Indexes for table `tbl_global_variables`
--
ALTER TABLE `tbl_global_variables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_workspace_id` (`workspace_id`),
  ADD KEY `idx_key` (`key`); -- Added for key lookups

--
-- Indexes for table `tbl_request_folders`
--
ALTER TABLE `tbl_request_folders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_collection_id` (`collection_id`),
  ADD KEY `idx_parent_folder_id` (`parent_folder_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_collection_parent` (`collection_id`,`parent_folder_id`), -- Composite for folder hierarchy queries
  ADD KEY `idx_parent_collection` (`parent_folder_id`,`collection_id`); -- Reverse composite for parent lookups

--
-- Indexes for table `tbl_request_headers`
--
ALTER TABLE `tbl_request_headers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_request_id` (`request_id`),
  ADD KEY `idx_header_key` (`header_key`); -- Added for header key lookups

--
-- Indexes for table `tbl_request_history`
--
ALTER TABLE `tbl_request_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_request_id` (`request_id`),
  ADD KEY `idx_sent_at` (`sent_at`), -- Added for sorting by sent_at
  ADD KEY `idx_user_sent_at` (`user_id`,`sent_at`), -- Composite for user history with sorting
  ADD KEY `idx_request_sent_at` (`request_id`,`sent_at`); -- Composite for request history with sorting

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_email` (`email`);

--
-- Indexes for table `tbl_workspaces`
--
ALTER TABLE `tbl_workspaces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_default_wks` (`is_default_wks`), -- Added for default workspace queries
  ADD KEY `idx_user_default` (`user_id`,`is_default_wks`); -- Composite for user default workspace queries

--
-- Indexes for table `tbl_workspace_members`
--
ALTER TABLE `tbl_workspace_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_workspace_user` (`workspace_id`,`user_id`), -- Changed to unique for data integrity
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_role` (`role`); -- Added for role-based queries

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_active_environments`
--
ALTER TABLE `tbl_active_environments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_api_requests`
--
ALTER TABLE `tbl_api_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_api_requests_draft`
--
ALTER TABLE `tbl_api_requests_draft`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_collections`
--
ALTER TABLE `tbl_collections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_environments`
--
ALTER TABLE `tbl_environments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_environment_variables`
--
ALTER TABLE `tbl_environment_variables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_global_variables`
--
ALTER TABLE `tbl_global_variables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_request_folders`
--
ALTER TABLE `tbl_request_folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_request_headers`
--
ALTER TABLE `tbl_request_headers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_request_history`
--
ALTER TABLE `tbl_request_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_workspaces`
--
ALTER TABLE `tbl_workspaces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_workspace_members`
--
ALTER TABLE `tbl_workspace_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_active_environments`
--
ALTER TABLE `tbl_active_environments`
  ADD CONSTRAINT `fk_active_env` FOREIGN KEY (`environment_id`) REFERENCES `tbl_environments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_active_env_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_active_env_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_api_requests`
--
ALTER TABLE `tbl_api_requests`
  ADD CONSTRAINT `fk_api_requests_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_api_requests_collection` FOREIGN KEY (`collection_id`) REFERENCES `tbl_collections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_api_requests_folder` FOREIGN KEY (`folder_id`) REFERENCES `tbl_request_folders` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_api_requests_draft`
-- ADDED: Missing foreign key constraints
--
ALTER TABLE `tbl_api_requests_draft`
  ADD CONSTRAINT `fk_draft_request` FOREIGN KEY (`request_id`) REFERENCES `tbl_api_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_draft_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_collections`
--
ALTER TABLE `tbl_collections`
  ADD CONSTRAINT `fk_collections_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_collections_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_environments`
--
ALTER TABLE `tbl_environments`
  ADD CONSTRAINT `fk_env_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_env_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_environment_variables`
--
ALTER TABLE `tbl_environment_variables`
  ADD CONSTRAINT `fk_env_vars` FOREIGN KEY (`environment_id`) REFERENCES `tbl_environments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_global_variables`
--
ALTER TABLE `tbl_global_variables`
  ADD CONSTRAINT `fk_globals_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_request_folders`
--
ALTER TABLE `tbl_request_folders`
  ADD CONSTRAINT `fk_folders_collection` FOREIGN KEY (`collection_id`) REFERENCES `tbl_collections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_folders_parent` FOREIGN KEY (`parent_folder_id`) REFERENCES `tbl_request_folders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_folders_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_request_headers`
--
ALTER TABLE `tbl_request_headers`
  ADD CONSTRAINT `fk_headers_request` FOREIGN KEY (`request_id`) REFERENCES `tbl_api_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_request_history`
--
ALTER TABLE `tbl_request_history`
  ADD CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_history_request` FOREIGN KEY (`request_id`) REFERENCES `tbl_api_requests` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_workspaces`
--
ALTER TABLE `tbl_workspaces`
  ADD CONSTRAINT `fk_workspaces_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_workspace_members`
--
ALTER TABLE `tbl_workspace_members`
  ADD CONSTRAINT `fk_members_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_members_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

