-- Migration script to support workspace-level messaging without channels
-- Run this after the initial chat_schema.sql

-- Make channel_id nullable in messages table
ALTER TABLE `tbl_chat_messages` 
MODIFY COLUMN `channel_id` int(11) NULL;

-- Remove foreign key constraint temporarily
ALTER TABLE `tbl_chat_messages` 
DROP FOREIGN KEY `fk_message_channel`;

-- Re-add foreign key constraint with ON DELETE SET NULL
ALTER TABLE `tbl_chat_messages` 
ADD CONSTRAINT `fk_message_channel` 
FOREIGN KEY (`channel_id`) REFERENCES `tbl_chat_channels` (`id`) ON DELETE SET NULL;

-- Add index for workspace-level queries
ALTER TABLE `tbl_chat_messages` 
ADD INDEX `idx_workspace_created` (`workspace_id`, `created_at`);

