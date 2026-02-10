
-- Add new columns to the existing goals table for smart goal logic
ALTER TABLE public.goals 
  ADD COLUMN IF NOT EXISTS last_manual_edit_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_suggestion_applied boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;
