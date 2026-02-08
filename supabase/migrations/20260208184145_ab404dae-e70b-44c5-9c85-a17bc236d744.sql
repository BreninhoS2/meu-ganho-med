-- ============= ROLE ENUM =============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.subscription_plan AS ENUM ('start', 'pro', 'premium');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'canceled', 'incomplete');

-- ============= USER ROLES TABLE =============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============= PROFILES TABLE =============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============= SUBSCRIPTIONS TABLE =============
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'start',
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============= ENTITLEMENTS TABLE =============
CREATE TABLE public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan subscription_plan NOT NULL,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (plan, feature_key)
);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

-- ============= EVENTS TABLE (PLANTÕES E CONSULTAS) =============
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('shift', 'consultation')),
  date DATE NOT NULL,
  location_id UUID,
  location_name TEXT,
  gross_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'value' CHECK (discount_type IN ('value', 'percentage')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending')),
  payment_date DATE,
  duration TEXT CHECK (duration IN ('12h', '24h', 'custom')),
  custom_hours NUMERIC(4,1),
  start_time TIME,
  end_time TIME,
  time TIME,
  patient_name TEXT,
  privacy_mode BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============= LOCATIONS TABLE =============
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'hospital' CHECK (type IN ('hospital', 'clinic')),
  default_shift_12h_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  default_shift_24h_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  default_consultation_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_deadline_days INTEGER NOT NULL DEFAULT 30,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- ============= EXPENSES TABLE =============
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('accountant', 'course', 'uniform', 'transport', 'food', 'equipment', 'other')),
  value NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ============= GOALS TABLE =============
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
  year INTEGER NOT NULL,
  target_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, month, year)
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- ============= SECURITY DEFINER FUNCTION FOR ROLE CHECK =============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============= RLS POLICIES =============

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Entitlements policies (public read for all authenticated users)
CREATE POLICY "Authenticated users can view entitlements" 
  ON public.entitlements FOR SELECT 
  TO authenticated
  USING (true);

-- Events policies
CREATE POLICY "Users can view their own events" 
  ON public.events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" 
  ON public.events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
  ON public.events FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
  ON public.events FOR DELETE 
  USING (auth.uid() = user_id);

-- Locations policies
CREATE POLICY "Users can view their own locations" 
  ON public.locations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations" 
  ON public.locations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations" 
  ON public.locations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations" 
  ON public.locations FOR DELETE 
  USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view their own expenses" 
  ON public.expenses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" 
  ON public.expenses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
  ON public.expenses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
  ON public.expenses FOR DELETE 
  USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view their own goals" 
  ON public.goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
  ON public.goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
  ON public.goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
  ON public.goals FOR DELETE 
  USING (auth.uid() = user_id);

-- ============= TRIGGER FOR UPDATED_AT =============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= TRIGGER TO CREATE PROFILE ON SIGNUP =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= INSERT DEFAULT ENTITLEMENTS =============
INSERT INTO public.entitlements (plan, feature_key, enabled) VALUES
  -- Start Plan Features
  ('start', 'agenda', true),
  ('start', 'locations', true),
  ('start', 'event_status', true),
  ('start', 'payment_status', true),
  ('start', 'net_value_calc', true),
  ('start', 'monthly_dashboard', true),
  ('start', 'calendar_view', true),
  ('start', 'cloud_backup', true),
  ('start', 'expenses_basic', false),
  ('start', 'receivables_smart', false),
  ('start', 'reports_by_location', false),
  ('start', 'monthly_goals', false),
  ('start', 'export_csv', false),
  ('start', 'export_ics', false),
  ('start', 'alerts_smart', false),
  ('start', 'reports_advanced', false),
  ('start', 'expenses_advanced', false),
  ('start', 'export_accountant', false),
  -- Pro Plan Features
  ('pro', 'agenda', true),
  ('pro', 'locations', true),
  ('pro', 'event_status', true),
  ('pro', 'payment_status', true),
  ('pro', 'net_value_calc', true),
  ('pro', 'monthly_dashboard', true),
  ('pro', 'calendar_view', true),
  ('pro', 'cloud_backup', true),
  ('pro', 'expenses_basic', true),
  ('pro', 'receivables_smart', true),
  ('pro', 'reports_by_location', true),
  ('pro', 'monthly_goals', true),
  ('pro', 'export_csv', true),
  ('pro', 'export_ics', true),
  ('pro', 'alerts_smart', false),
  ('pro', 'reports_advanced', false),
  ('pro', 'expenses_advanced', false),
  ('pro', 'export_accountant', false),
  -- Premium Plan Features
  ('premium', 'agenda', true),
  ('premium', 'locations', true),
  ('premium', 'event_status', true),
  ('premium', 'payment_status', true),
  ('premium', 'net_value_calc', true),
  ('premium', 'monthly_dashboard', true),
  ('premium', 'calendar_view', true),
  ('premium', 'cloud_backup', true),
  ('premium', 'expenses_basic', true),
  ('premium', 'receivables_smart', true),
  ('premium', 'reports_by_location', true),
  ('premium', 'monthly_goals', true),
  ('premium', 'export_csv', true),
  ('premium', 'export_ics', true),
  ('premium', 'alerts_smart', true),
  ('premium', 'reports_advanced', true),
  ('premium', 'expenses_advanced', true),
  ('premium', 'export_accountant', true);