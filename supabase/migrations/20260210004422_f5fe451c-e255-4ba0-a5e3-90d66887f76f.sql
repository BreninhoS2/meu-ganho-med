
CREATE TABLE public.user_shortcuts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  shortcut_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_shortcuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shortcuts"
ON public.user_shortcuts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shortcuts"
ON public.user_shortcuts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shortcuts"
ON public.user_shortcuts FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_shortcuts_updated_at
BEFORE UPDATE ON public.user_shortcuts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
