-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Dec 06, 2025 at 10:39 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('ltQFkrR6SpYqw8cTwCo-UJmJHfZUg204', 1765143154, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-07T19:06:03.934Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":3,\"name\":\"Purushoth New\",\"email\":\"purushoth04112001@gmail.com\"}}');

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
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `tbl_active_environments`
--
ALTER TABLE `tbl_active_environments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_workspace` (`workspace_id`,`user_id`),
  ADD KEY `fk_active_env` (`environment_id`),
  ADD KEY `fk_active_env_user` (`user_id`);

--
-- Indexes for table `tbl_api_requests`
--
ALTER TABLE `tbl_api_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `collection_id` (`collection_id`),
  ADD KEY `folder_id` (`folder_id`);

--
-- Indexes for table `tbl_api_requests_draft`
--
ALTER TABLE `tbl_api_requests_draft`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_draft_user_request` (`request_id`,`user_id`);

--
-- Indexes for table `tbl_collections`
--
ALTER TABLE `tbl_collections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_collections_workspace` (`workspace_id`);

--
-- Indexes for table `tbl_environments`
--
ALTER TABLE `tbl_environments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_env_workspace` (`workspace_id`),
  ADD KEY `fk_env_user` (`user_id`);

--
-- Indexes for table `tbl_environment_variables`
--
ALTER TABLE `tbl_environment_variables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_env_vars` (`environment_id`);

--
-- Indexes for table `tbl_global_variables`
--
ALTER TABLE `tbl_global_variables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_globals_workspace` (`workspace_id`);

--
-- Indexes for table `tbl_request_folders`
--
ALTER TABLE `tbl_request_folders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `collection_id` (`collection_id`),
  ADD KEY `parent_folder_id` (`parent_folder_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_request_headers`
--
ALTER TABLE `tbl_request_headers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `tbl_request_history`
--
ALTER TABLE `tbl_request_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tbl_workspaces`
--
ALTER TABLE `tbl_workspaces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_workspace_members`
--
ALTER TABLE `tbl_workspace_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workspace_id` (`workspace_id`),
  ADD KEY `user_id` (`user_id`);

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
  ADD CONSTRAINT `tbl_api_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_api_requests_ibfk_2` FOREIGN KEY (`collection_id`) REFERENCES `tbl_collections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tbl_api_requests_ibfk_3` FOREIGN KEY (`folder_id`) REFERENCES `tbl_request_folders` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_collections`
--
ALTER TABLE `tbl_collections`
  ADD CONSTRAINT `fk_collections_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_collections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `tbl_request_folders_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `tbl_collections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_request_folders_ibfk_2` FOREIGN KEY (`parent_folder_id`) REFERENCES `tbl_request_folders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_request_folders_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_request_headers`
--
ALTER TABLE `tbl_request_headers`
  ADD CONSTRAINT `tbl_request_headers_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `tbl_api_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_request_history`
--
ALTER TABLE `tbl_request_history`
  ADD CONSTRAINT `tbl_request_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_request_history_ibfk_2` FOREIGN KEY (`request_id`) REFERENCES `tbl_api_requests` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_workspaces`
--
ALTER TABLE `tbl_workspaces`
  ADD CONSTRAINT `tbl_workspaces_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_workspace_members`
--
ALTER TABLE `tbl_workspace_members`
  ADD CONSTRAINT `tbl_workspace_members_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `tbl_workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_workspace_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
