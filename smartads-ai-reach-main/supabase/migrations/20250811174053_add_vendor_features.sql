-- Add vendor role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vendor';

-- Create check_ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  location GEOGRAPHY(POINT, 4326),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create task_photos table
CREATE TABLE IF NOT EXISTS public.task_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for vendor access
CREATE POLICY "Vendors can view their assigned campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid()
);

CREATE POLICY "Vendors can view their assigned tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid()
);

CREATE POLICY "Vendors can create check-ins"
ON public.check_ins
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id 
    AND t.assigned_to = auth.uid()
  )
);

CREATE POLICY "Vendors can upload task photos"
ON public.task_photos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id 
    AND t.assigned_to = auth.uid()
  )
);
