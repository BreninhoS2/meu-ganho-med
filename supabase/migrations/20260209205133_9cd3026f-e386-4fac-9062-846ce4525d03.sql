-- Add paid_at column to track when a payment was marked as paid
ALTER TABLE public.events ADD COLUMN paid_at timestamptz NULL;