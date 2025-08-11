-- Fix function search path issues
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, entity_type, entity_id, title, message, type)
  VALUES (p_user_id, p_entity_type, p_entity_id, p_title, p_message, p_type)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Fix function search path issues
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_entity_name TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activities (user_id, action, entity_type, entity_id, entity_name, details)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_entity_name, p_details)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;