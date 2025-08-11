-- Add vendor role to app_role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'executive', 'vendor');
  ELSIF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vendor' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'vendor';
  END IF;
END $$;

-- Create check_ins table for vendor check-ins
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create task_photos table for proof photos
CREATE TABLE IF NOT EXISTS public.task_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create expenses table for vendor expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_check_ins_task_id ON public.check_ins(task_id);
CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX idx_task_photos_task_id ON public.task_photos(task_id);
CREATE INDEX idx_task_photos_user_id ON public.task_photos(user_id);
CREATE INDEX idx_expenses_task_id ON public.expenses(task_id);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);

-- Enable RLS on new tables
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor access
-- Vendors can view their assigned campaigns
CREATE POLICY "Vendors can view their assigned campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (
  assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Vendors can view their assigned tasks
CREATE POLICY "Vendors can view their assigned tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Vendors can create check-ins for their tasks
CREATE POLICY "Vendors can create check-ins"
ON public.check_ins
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id 
    AND t.assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Vendors can upload photos for their tasks
CREATE POLICY "Vendors can upload task photos"
ON public.task_photos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id 
    AND t.assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Vendors can create expenses for their tasks
CREATE POLICY "Vendors can create expenses"
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id 
    AND t.assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Vendors can view their own check-ins, photos, and expenses
CREATE POLICY "Vendors can view their own check-ins"
ON public.check_ins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Vendors can view their own task photos"
ON public.task_photos
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Vendors can view their own expenses"
ON public.expenses
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_check_ins_updated_at
  BEFORE UPDATE ON public.check_ins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
