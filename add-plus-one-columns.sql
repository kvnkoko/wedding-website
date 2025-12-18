-- Migration script to add Plus One columns to rsvp_event_responses table
-- Run this on your production database

-- Check if columns exist before adding them
DO $$
BEGIN
    -- Add plus_one column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvp_event_responses' 
        AND column_name = 'plus_one'
    ) THEN
        ALTER TABLE rsvp_event_responses 
        ADD COLUMN plus_one BOOLEAN DEFAULT false;
    END IF;

    -- Add plus_one_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvp_event_responses' 
        AND column_name = 'plus_one_name'
    ) THEN
        ALTER TABLE rsvp_event_responses 
        ADD COLUMN plus_one_name TEXT;
    END IF;

    -- Add plus_one_relation column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvp_event_responses' 
        AND column_name = 'plus_one_relation'
    ) THEN
        ALTER TABLE rsvp_event_responses 
        ADD COLUMN plus_one_relation TEXT;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvp_event_responses' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE rsvp_event_responses 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

