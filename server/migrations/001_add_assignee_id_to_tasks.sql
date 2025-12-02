-- Migration: Add assignee_id column to tasks table
-- This column stores the ID of the user assigned to the task

ALTER TABLE users.tasks ADD COLUMN IF NOT EXISTS assignee_id INTEGER REFERENCES users.students(id) ON DELETE SET NULL;
