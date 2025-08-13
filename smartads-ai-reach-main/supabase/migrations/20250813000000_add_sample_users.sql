-- Add sample users for testing the user management interface
-- This migration adds sample users with different roles to demonstrate the functionality

-- Insert sample users into auth.users first (this would normally be done through Supabase Auth)
-- For demo purposes, we'll insert directly into profiles table

INSERT INTO public.profiles (id, user_id, full_name, email, phone, role, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), gen_random_uuid(), 'Priya Sharma', 'priya.sharma@smartads.com', '+91-9876543210', 'admin', true, now() - interval '30 days', now() - interval '1 day'),
(gen_random_uuid(), gen_random_uuid(), 'Rajesh Kumar', 'rajesh.kumar@smartads.com', '+91-9876543211', 'manager', true, now() - interval '25 days', now() - interval '2 hours'),
(gen_random_uuid(), gen_random_uuid(), 'Anjali Patel', 'anjali.patel@smartads.com', '+91-9876543212', 'executive', true, now() - interval '20 days', now() - interval '30 minutes'),
(gen_random_uuid(), gen_random_uuid(), 'Vikram Singh', 'vikram.singh@vendor.com', '+91-9876543213', 'vendor', true, now() - interval '15 days', now() - interval '5 minutes'),
(gen_random_uuid(), gen_random_uuid(), 'Sneha Reddy', 'sneha.reddy@smartads.com', '+91-9876543214', 'manager', true, now() - interval '10 days', now() - interval '1 hour'),
(gen_random_uuid(), gen_random_uuid(), 'Arjun Mehta', 'arjun.mehta@vendor.com', '+91-9876543215', 'vendor', true, now() - interval '8 days', now() - interval '15 minutes'),
(gen_random_uuid(), gen_random_uuid(), 'Kavya Nair', 'kavya.nair@smartads.com', '+91-9876543216', 'executive', true, now() - interval '5 days', now() - interval '3 hours'),
(gen_random_uuid(), gen_random_uuid(), 'Rohit Gupta', 'rohit.gupta@smartads.com', '+91-9876543217', 'executive', false, now() - interval '45 days', now() - interval '30 days'),
(gen_random_uuid(), gen_random_uuid(), 'Deepika Joshi', 'deepika.joshi@vendor.com', '+91-9876543218', 'vendor', true, now() - interval '3 days', now() - interval '10 minutes'),
(gen_random_uuid(), gen_random_uuid(), 'Aditya Verma', 'aditya.verma@smartads.com', '+91-9876543219', 'admin', true, now() - interval '60 days', now() - interval '6 hours');

-- Update the profiles to have more realistic data
UPDATE public.profiles SET 
  avatar_url = CASE 
    WHEN role = 'admin' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    WHEN role = 'manager' THEN 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    WHEN role = 'executive' THEN 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    WHEN role = 'vendor' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    ELSE NULL
  END
WHERE created_at > now() - interval '61 days';
