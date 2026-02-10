
-- Table to store user bottom nav preferences (order + visible items)
CREATE TABLE public.user_nav_prefs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  visible_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_nav_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nav prefs"
  ON public.user_nav_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nav prefs"
  ON public.user_nav_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nav prefs"
  ON public.user_nav_prefs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_nav_prefs_updated_at
  BEFORE UPDATE ON public.user_nav_prefs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
