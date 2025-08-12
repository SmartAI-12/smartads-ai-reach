-- AI Insights table for campaign predictions and suggestions
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('prediction', 'suggestion', 'anomaly')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('never', 'immediate', 'daily', 'weekly')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_campaign ON public.ai_insights(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON public.leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- RLS policies for new tables
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for AI Insights
CREATE POLICY "Users can view insights for their campaigns" 
ON public.ai_insights
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE id = campaign_id 
    AND (created_by = auth.uid() OR id IN (
      SELECT campaign_id FROM public.campaign_assignees WHERE user_id = auth.uid()
    ))
);

-- RLS policies for Notification Preferences
CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences
FOR ALL
USING (user_id = auth.uid());

-- RLS policies for Leads
CREATE POLICY "Team members can manage leads for their campaigns" 
ON public.leads
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE id = campaign_id 
    AND (created_by = auth.uid() OR id IN (
      SELECT campaign_id FROM public.campaign_assignees WHERE user_id = auth.uid()
    ))
);
