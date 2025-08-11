-- Update user role to admin for parag21ceo@gmail.com
UPDATE profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'parag21ceo@gmail.com';