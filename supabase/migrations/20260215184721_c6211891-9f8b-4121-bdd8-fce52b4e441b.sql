
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS override_used boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS override_at timestamp with time zone DEFAULT NULL;
