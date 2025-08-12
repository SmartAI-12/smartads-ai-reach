-- Create storage bucket for task photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-photos',
  'task-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policy for task photos
CREATE POLICY "Vendors can upload task photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-photos' AND
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id::text = (storage.foldername(name))[1]
    AND t.assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Create storage policy for viewing task photos
CREATE POLICY "Vendors can view their task photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-photos' AND
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id::text = (storage.foldername(name))[1]
    AND t.assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Create storage policy for managers/admins to view all task photos
CREATE POLICY "Managers can view all task photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-photos' AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'manager')
  )
);
