-- Add refresh token column to users table
ALTER TABLE users ADD COLUMN refresh_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN refresh_token_expires DATETIME NULL;