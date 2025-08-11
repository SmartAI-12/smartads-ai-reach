-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'executive');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.expense_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role app_role DEFAULT 'executive',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  contact_person TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  status campaign_status DEFAULT 'draft',
  budget DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  objectives TEXT,
  kpis JSONB,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create execution_reports table
CREATE TABLE public.execution_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  report_date DATE NOT NULL,
  activities_completed TEXT[],
  metrics JSONB,
  challenges TEXT,
  next_steps TEXT,
  photos TEXT[],
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  status expense_status DEFAULT 'pending',
  receipt_url TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  status lead_status DEFAULT 'new',
  notes TEXT,
  score INTEGER DEFAULT 0,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'campaign', 'task', 'expense', etc.
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$;

-- Create security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = $1 AND role = $2
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for clients
CREATE POLICY "Users can view all clients" ON public.clients
  FOR SELECT USING (true);

CREATE POLICY "Managers and admins can create clients" ON public.clients
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Managers and admins can update clients" ON public.clients
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- RLS Policies for campaigns
CREATE POLICY "Users can view all campaigns" ON public.campaigns
  FOR SELECT USING (true);

CREATE POLICY "Managers and admins can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Managers, admins, and assigned users can update campaigns" ON public.campaigns
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager') OR
    assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view all tasks" ON public.tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update tasks they created or are assigned to" ON public.tasks
  FOR UPDATE USING (
    created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- RLS Policies for execution_reports
CREATE POLICY "Users can view all execution reports" ON public.execution_reports
  FOR SELECT USING (true);

CREATE POLICY "Users can create execution reports" ON public.execution_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own execution reports" ON public.execution_reports
  FOR UPDATE USING (
    created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- RLS Policies for expenses
CREATE POLICY "Users can view all expenses" ON public.expenses
  FOR SELECT USING (true);

CREATE POLICY "Users can create expenses" ON public.expenses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own expenses or managers can approve" ON public.expenses
  FOR UPDATE USING (
    created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- RLS Policies for leads
CREATE POLICY "Users can view all leads" ON public.leads
  FOR SELECT USING (true);

CREATE POLICY "Users can create leads" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update leads they created" ON public.leads
  FOR UPDATE USING (
    created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- RLS Policies for comments
CREATE POLICY "Users can view all comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (
    created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    'executive'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_execution_reports_updated_at
  BEFORE UPDATE ON public.execution_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('campaign-assets', 'campaign-assets', false),
  ('expense-receipts', 'expense-receipts', false),
  ('execution-photos', 'execution-photos', false);

-- Storage policies for campaign-assets bucket
CREATE POLICY "Users can view campaign assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaign-assets');

CREATE POLICY "Users can upload campaign assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'campaign-assets');

-- Storage policies for expense-receipts bucket
CREATE POLICY "Users can view expense receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'expense-receipts');

CREATE POLICY "Users can upload expense receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'expense-receipts');

-- Storage policies for execution-photos bucket
CREATE POLICY "Users can view execution photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'execution-photos');

CREATE POLICY "Users can upload execution photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'execution-photos');