-- Create BTL-specific enums
CREATE TYPE public.btl_channel AS ENUM (
  'metro_branding', 
  'mall_activation', 
  'pamphlet_distribution', 
  'street_branding', 
  'transit_advertising', 
  'experiential_marketing'
);

CREATE TYPE public.vendor_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TYPE public.checkin_type AS ENUM (
  'campaign_start', 
  'campaign_end', 
  'milestone_update', 
  'issue_report'
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  gst_number TEXT,
  service_areas TEXT[], -- Array of cities/regions
  specializations btl_channel[], -- Types of BTL they handle
  status vendor_status DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendors
CREATE POLICY "Users can view all vendors" 
ON public.vendors 
FOR SELECT 
USING (true);

CREATE POLICY "Managers and admins can create vendors" 
ON public.vendors 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers and admins can update vendors" 
ON public.vendors 
FOR UPDATE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

-- Extend campaigns table with BTL-specific fields
ALTER TABLE public.campaigns 
ADD COLUMN city TEXT,
ADD COLUMN channel_type btl_channel,
ADD COLUMN vendor_id UUID REFERENCES public.vendors(id),
ADD COLUMN kpi_targets JSONB,
ADD COLUMN actual_performance JSONB,
ADD COLUMN geo_coordinates POINT,
ADD COLUMN priority TEXT DEFAULT 'medium';

-- Create geo_checkins table
CREATE TABLE public.geo_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  checkin_type checkin_type NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on geo_checkins
ALTER TABLE public.geo_checkins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for geo_checkins
CREATE POLICY "Users can view all geo checkins" 
ON public.geo_checkins 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create geo checkins" 
ON public.geo_checkins 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own geo checkins" 
ON public.geo_checkins 
FOR UPDATE 
USING (user_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Create ai_insights table
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  actionable_recommendations TEXT[],
  data_used JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on ai_insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_insights
CREATE POLICY "Users can view all ai insights" 
ON public.ai_insights 
FOR SELECT 
USING (true);

CREATE POLICY "System can create ai insights" 
ON public.ai_insights 
FOR INSERT 
WITH CHECK (true);

-- Create campaign_reports table
CREATE TABLE public.campaign_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL,
  generated_for UUID NOT NULL,
  pdf_url TEXT,
  email_sent BOOLEAN DEFAULT false,
  data_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on campaign_reports
ALTER TABLE public.campaign_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaign_reports
CREATE POLICY "Users can view their own campaign reports" 
ON public.campaign_reports 
FOR SELECT 
USING (generated_for = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "System can create campaign reports" 
ON public.campaign_reports 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_vendors_status ON public.vendors(status);
CREATE INDEX idx_vendors_service_areas ON public.vendors USING GIN(service_areas);
CREATE INDEX idx_campaigns_city ON public.campaigns(city);
CREATE INDEX idx_campaigns_channel_type ON public.campaigns(channel_type);
CREATE INDEX idx_campaigns_vendor_id ON public.campaigns(vendor_id);
CREATE INDEX idx_geo_checkins_campaign_id ON public.geo_checkins(campaign_id);
CREATE INDEX idx_geo_checkins_user_id ON public.geo_checkins(user_id);
CREATE INDEX idx_geo_checkins_location ON public.geo_checkins(latitude, longitude);
CREATE INDEX idx_ai_insights_campaign_id ON public.ai_insights(campaign_id);
CREATE INDEX idx_campaign_reports_campaign_id ON public.campaign_reports(campaign_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();