-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Nov 30, 2025 at 01:10 PM
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
-- Table structure for table `tbl_active_environments`
--

CREATE TABLE `tbl_active_environments` (
  `id` int(11) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `environment_id` int(11) DEFAULT NULL,
  `set_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_active_environments`
--

INSERT INTO `tbl_active_environments` (`id`, `workspace_id`, `user_id`, `environment_id`, `set_at`) VALUES
(1, 1, 1, 5, '2025-11-05 14:57:00');

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

--
-- Dumping data for table `tbl_api_requests`
--

INSERT INTO `tbl_api_requests` (`id`, `collection_id`, `user_id`, `name`, `method`, `url`, `body_raw`, `body_formdata`, `queryParams`, `response`, `response_code`, `created_at`, `updated_at`, `folder_id`) VALUES
(1, 1, 1, 'Testing One32', 'GET', 'hihihoihjgjhg', '', '', '\"[]\"', NULL, NULL, '2025-08-17 16:02:00', '2025-10-29 14:35:11', 1),
(2, 1, 1, 'second request', 'GET', 'http://localhost:5000/api/api/getWorkspaces?user_id=1', '', '', '[{\"key\":\"user_id\",\"value\":\"1\"}]', NULL, NULL, '2025-08-17 16:42:17', '2025-08-30 06:11:07', 1),
(4, NULL, 1, 'request id', 'GET', '', '', NULL, NULL, NULL, NULL, '2025-08-24 07:11:58', '2025-08-24 07:11:58', NULL),
(5, 1, 1, 'testing', 'GET', '', '', NULL, NULL, NULL, NULL, '2025-08-24 10:50:15', '2025-08-24 16:52:49', NULL),
(11, 1, 1, 'ffdhd', 'GET', '', '', NULL, NULL, NULL, NULL, '2025-08-25 01:28:17', '2025-08-25 01:28:17', NULL),
(12, 1, 1, 'Untitled Request', 'GET', 'hihihoihjgjhg12324', '', '', '[]', NULL, NULL, '2025-08-29 14:16:20', '2025-08-30 05:17:30', NULL),
(13, 8, 2, 'new reques', 'GET', '', '', NULL, NULL, NULL, NULL, '2025-08-30 06:58:53', '2025-08-30 06:58:53', NULL),
(14, 9, 1, 'get workspacce', 'GET', '', '', NULL, NULL, NULL, NULL, '2025-10-08 19:45:28', '2025-10-08 19:45:28', NULL);

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

--
-- Dumping data for table `tbl_api_requests_draft`
--

INSERT INTO `tbl_api_requests_draft` (`id`, `request_id`, `user_id`, `name`, `method`, `url`, `body_raw`, `body_formdata`, `queryParams`, `response`, `response_code`, `created_at`, `updated_at`) VALUES
(11, 13, 1, 'new reques', NULL, NULL, NULL, NULL, '[]', NULL, NULL, '2025-10-02 16:11:20', '2025-10-06 16:00:19'),
(15, 2, 1, 'second request', NULL, 'http://localhost:5000/api/api/getWorkspaces?user_id={{user_id}}', NULL, NULL, '[{\"key\":\"user_id\",\"value\":\"{{user_id}}\"}]', NULL, NULL, '2025-10-06 16:34:18', '2025-10-06 17:02:45'),
(20, 5, 1, 'testing', NULL, 'http://localhost:5000/api/api/getWorkspaces?user_id=1', NULL, NULL, '[{\"key\":\"user_id\",\"value\":\"1\"}]', NULL, NULL, '2025-10-08 19:45:33', '2025-10-08 19:45:33'),
(21, 14, 1, 'get workspacce', NULL, 'http://localhost:5000/api/api/getWorkspaces?user_id={{variable_1}}', NULL, NULL, '[{\"key\":\"user_id\",\"value\":\"{{variable_1}}\"}]', NULL, NULL, '2025-10-08 19:46:28', '2025-10-08 19:47:34'),
(24, 1, 1, 'Testing One32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-12 04:18:47', '2025-10-29 15:04:00');

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

--
-- Dumping data for table `tbl_collections`
--

INSERT INTO `tbl_collections` (`id`, `user_id`, `name`, `workspace_id`, `created_at`) VALUES
(1, 1, 'First collection', 1, '2025-08-17 16:01:34'),
(3, 1, 'Testing', 1, '2025-08-17 16:52:00'),
(4, 1, 'Test', 1, '2025-08-17 16:54:34'),
(5, 1, 'third request', 1, '2025-08-18 17:08:27'),
(6, 1, 'third request', 1, '2025-08-18 17:10:37'),
(7, 1, 'third request', 1, '2025-08-22 15:48:14'),
(8, 2, 'new collect', 3, '2025-08-30 06:58:44'),
(9, 1, 'Postmon', 1, '2025-10-08 19:45:12'),
(10, 1, 'post', 1, '2025-10-12 05:54:25'),
(11, 1, 'post2', 1, '2025-10-12 05:55:32'),
(12, 1, 'socket collection', 1, '2025-10-12 16:45:04'),
(15, 1, 'sck', 1, '2025-10-12 16:52:40'),
(16, 1, 'new sock', 1, '2025-10-12 16:57:28'),
(17, 1, 'hhf', 1, '2025-10-12 17:02:54'),
(18, 1, 'test', 1, '2025-10-12 17:12:57'),
(19, 1, 'test', 1, '2025-10-14 14:59:28');

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

--
-- Dumping data for table `tbl_environments`
--

INSERT INTO `tbl_environments` (`id`, `workspace_id`, `user_id`, `name`, `created_at`) VALUES
(1, 3, 1, 'New environmentt', '2025-10-02 16:55:40'),
(2, 3, 1, 'Environment 2', '2025-10-06 16:11:21'),
(3, 1, 1, 'New one', '2025-10-06 16:27:11'),
(4, 1, 1, 'second', '2025-10-06 17:03:10'),
(5, 1, 1, 'sdfsdf', '2025-10-06 17:08:12');

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

--
-- Dumping data for table `tbl_environment_variables`
--

INSERT INTO `tbl_environment_variables` (`id`, `environment_id`, `key`, `value`, `type`) VALUES
(1, 1, 'variable_1', '762386', 'default'),
(2, 1, 'variable_2', '', 'default'),
(4, 4, 'variable_1', 'test', 'default'),
(6, 3, 'variable_1', '', 'default'),
(8, 5, 'variable_1', '1', 'default');

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

--
-- Dumping data for table `tbl_global_variables`
--

INSERT INTO `tbl_global_variables` (`id`, `workspace_id`, `key`, `value`, `type`) VALUES
(2, 1, 'variable_1', '2', 'default');

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

--
-- Dumping data for table `tbl_request_folders`
--

INSERT INTO `tbl_request_folders` (`id`, `collection_id`, `parent_folder_id`, `user_id`, `name`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 1, 'First Folderr', '2025-08-17 10:31:47', '2025-10-15 17:40:13'),
(8, 3, NULL, 1, 'primary f1', '2025-08-24 09:43:03', '2025-08-24 09:43:03'),
(11, 8, NULL, 2, 'TEst', '2025-08-30 01:34:31', '2025-08-30 01:34:31'),
(14, 1, 1, 1, 'test', '2025-10-15 11:55:22', '2025-10-15 11:55:22'),
(17, 1, NULL, 1, 'test2', '2025-10-15 12:06:00', '2025-10-15 12:06:00'),
(19, 1, 1, 1, 'test2', '2025-10-15 12:11:10', '2025-10-15 12:11:10'),
(21, 1, 1, 1, 'new', '2025-10-15 12:16:58', '2025-10-15 12:16:58'),
(22, 1, 1, 1, 'new 2', '2025-10-15 12:20:51', '2025-10-15 12:20:51'),
(23, 1, 1, 1, 'lkjlkj', '2025-10-15 12:21:46', '2025-10-15 12:21:46'),
(24, 1, 1, 1, 'kjkjl', '2025-10-15 12:22:32', '2025-10-15 12:22:32'),
(25, 1, 1, 1, 'nothing', '2025-10-15 12:22:56', '2025-10-15 12:22:56'),
(26, 1, 1, 1, 'n2', '2025-10-15 12:23:07', '2025-10-15 12:23:07'),
(27, 1, 1, 1, 'n3', '2025-10-15 12:26:32', '2025-10-15 12:26:32'),
(28, 1, 1, 1, 'n4', '2025-10-15 12:29:03', '2025-10-15 12:29:03'),
(29, 1, 1, 1, 'n5', '2025-10-15 12:42:57', '2025-10-15 12:42:57'),
(30, 1, 1, 1, 'test', '2025-10-15 13:05:34', '2025-10-15 13:05:34');

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

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Purushoth', 'purushoth411@gmail.com', '123456', '2025-08-17 16:01:25'),
(2, 'purushoth2', 'purushoth2@4112001', '123456', '2025-08-30 06:58:02');

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

--
-- Dumping data for table `tbl_workspaces`
--

INSERT INTO `tbl_workspaces` (`id`, `user_id`, `name`, `description`, `created_at`, `updated_at`, `is_default_wks`) VALUES
(1, 1, 'My Workspace', NULL, '2025-08-17 16:01:25', '2025-08-17 16:01:25', '0'),
(2, 2, 'My Workspace', NULL, '2025-08-30 06:58:02', '2025-08-30 06:58:02', '0'),
(3, 2, 'Team Workspace', NULL, '2025-08-30 06:58:36', '2025-08-30 06:58:36', ''),
(5, 1, 'del Workspace', NULL, '2025-10-29 16:14:48', '2025-10-29 16:14:48', ''),
(6, 1, 'del Workspace1', NULL, '2025-10-29 16:15:07', '2025-10-29 16:34:54', '');

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
-- Dumping data for table `tbl_workspace_members`
--

INSERT INTO `tbl_workspace_members` (`id`, `workspace_id`, `user_id`, `role`, `added_at`) VALUES
(1, 1, 1, 'OWNER', '2025-08-17 16:01:25'),
(2, 2, 2, 'OWNER', '2025-08-30 06:58:02'),
(3, 3, 2, 'OWNER', '2025-08-30 06:58:36'),
(4, 3, 1, 'VIEWER', '2025-08-30 06:58:36'),
(6, 5, 1, 'OWNER', '2025-10-29 16:14:48'),
(7, 6, 1, 'OWNER', '2025-10-29 16:15:07'),
(8, 6, 2, 'VIEWER', '2025-10-29 16:15:07');

--
-- Indexes for dumped tables
--

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tbl_api_requests`
--
ALTER TABLE `tbl_api_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tbl_api_requests_draft`
--
ALTER TABLE `tbl_api_requests_draft`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `tbl_collections`
--
ALTER TABLE `tbl_collections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `tbl_environments`
--
ALTER TABLE `tbl_environments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_environment_variables`
--
ALTER TABLE `tbl_environment_variables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbl_global_variables`
--
ALTER TABLE `tbl_global_variables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_request_folders`
--
ALTER TABLE `tbl_request_folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_workspaces`
--
ALTER TABLE `tbl_workspaces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_workspace_members`
--
ALTER TABLE `tbl_workspace_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
