-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Aug 18, 2025 at 06:57 PM
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
(1, 1, 1, 'first request', 'POST', 'http://localhost:5000/api/api/addCollection', '{\n\"user_id\":\"1\"\n}', '[{\"key\":\"name\",\"value\":\"third request\",\"description\":\"\",\"type\":\"text\"},{\"key\":\"wks_id\",\"value\":\"1\",\"description\":\"\",\"type\":\"text\"},{\"key\":\"user_id\",\"value\":\"1\",\"description\":\"\",\"type\":\"text\"}]', NULL, NULL, NULL, '2025-08-17 16:02:00', '2025-08-18 16:56:03', 1),
(2, 1, 1, 'second request', 'GET', 'http://localhost:5000/api/api/getWorkspaces?user_id=4', '', NULL, '[{\"key\":\"user_id\",\"value\":\"4\"}]', NULL, NULL, '2025-08-17 16:42:17', '2025-08-18 16:52:06', 1);

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
(1, 1, 'First collectionn', 1, '2025-08-17 16:01:34'),
(2, 1, 'Test', 1, '2025-08-17 16:09:58'),
(3, 1, 'Test', 1, '2025-08-17 16:52:00'),
(4, 1, 'Test', 1, '2025-08-17 16:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_environments`
--

CREATE TABLE `tbl_environments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `variables` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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

--
-- Dumping data for table `tbl_request_folders`
--

INSERT INTO `tbl_request_folders` (`id`, `collection_id`, `parent_folder_id`, `user_id`, `name`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 1, 'First Folder', '2025-08-17 10:31:47', '2025-08-17 10:31:47');

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
(1, 'Purushoth', 'purushoth411@gmail.com', '123456', '2025-08-17 16:01:25');

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
(1, 1, 'My Workspace', NULL, '2025-08-17 16:01:25', '2025-08-17 16:01:25', '0');

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
(1, 1, 1, 'OWNER', '2025-08-17 16:01:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_api_requests`
--
ALTER TABLE `tbl_api_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `collection_id` (`collection_id`),
  ADD KEY `folder_id` (`folder_id`);

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
  ADD KEY `user_id` (`user_id`);

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
-- AUTO_INCREMENT for table `tbl_api_requests`
--
ALTER TABLE `tbl_api_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_collections`
--
ALTER TABLE `tbl_collections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_environments`
--
ALTER TABLE `tbl_environments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_request_folders`
--
ALTER TABLE `tbl_request_folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_workspaces`
--
ALTER TABLE `tbl_workspaces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_workspace_members`
--
ALTER TABLE `tbl_workspace_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `tbl_environments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

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
