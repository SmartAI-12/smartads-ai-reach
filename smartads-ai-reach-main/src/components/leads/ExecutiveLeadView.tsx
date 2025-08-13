import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Star, 
  Phone, 
  Mail, 
  Plus,
  TrendingUp,
  Target,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';

export const ExecutiveLeadView: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  
  const { data: allLeads, isLoading } = useLeads();
  const { data: campaigns } = useCampaigns();
  const updateLead = useUpdateLead();

  // Filter leads for executive user
  const myLeads = allLeads?.filter(lead => 
    lead.created_by === profile?.id
  ) || [];

  const activeLeads = myLeads.filter(lead => 
    ['new', 'contacted', 'qualified'].includes(lead.status)
  );
  const convertedLeads = myLeads.filter(lead => lead.status === 'converted');
  const lostLeads = myLeads.filter(lead => lead.status === 'lost');

  // Apply campaign filter
  const getFilteredLeads = (leads: any[]) => {
    return campaignFilter === 'all' 
      ? leads 
      : leads.filter(lead => lead.campaign_id === campaignFilter);
  };

  const conversionRate = myLeads.length > 0 
    ? Math.round((convertedLeads.length / myLeads.length) * 100) 
    : 0;

  const averageScore = myLeads.length > 0 
    ? Math.round(myLeads.reduce((sum, lead) => sum + lead.score, 0) / myLeads.length)
    : 0;

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      await updateLead.mutateAsync({
        id: leadId,
        status: newStatus as any,
        converted_at: newStatus === 'converted' ? new Date().toISOString() : null
      });
      
      toast({
        title: "Lead Updated",
        description: `Lead status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'text-green-600 bg-green-50 border-green-200';
      case 'qualified': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'contacted': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'new': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'lost': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'converted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'qualified': return <Star className="h-4 w-4 text-blue-600" />;
      case 'contacted': return <Phone className="h-4 w-4 text-yellow-600" />;
      case 'new': return <AlertCircle className="h-4 w-4 text-purple-600" />;
      case 'lost': return <Clock className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const LeadCard: React.FC<{ lead: any }> = ({ lead }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium mb-1 flex items-center gap-2">
              {getStatusIcon(lead.status)}
              {lead.name}
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              {lead.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(lead.status)}>
              {lead.status}
            </Badge>
            <div className={`text-sm font-medium mt-1 px-2 py-1 rounded ${getScoreColor(lead.score)}`}>
              Score: {lead.score}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{lead.campaigns?.name || 'No campaign'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(lead.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/leads/${lead.id}`)}
          >
            View Details
          </Button>
          {lead.status === 'new' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleStatusUpdate(lead.id, 'contacted')}
            >
              Mark Contacted
            </Button>
          )}
          {lead.status === 'contacted' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleStatusUpdate(lead.id, 'qualified')}
            >
              Qualify
            </Button>
          )}
          {lead.status === 'qualified' && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusUpdate(lead.id, 'converted')}
            >
              Convert
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Leads
          </h1>
          <p className="text-muted-foreground">
            Manage and track your lead pipeline
          </p>
        </div>
        <Button onClick={() => navigate('/leads/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Lead Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{myLeads.length}</div>
            <div className="text-sm text-muted-foreground">Total Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{activeLeads.length}</div>
            <div className="text-sm text-muted-foreground">Active Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{convertedLeads.length}</div>
            <div className="text-sm text-muted-foreground">Converted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{conversionRate}%</div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <EnhancedCard className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Conversion Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Conversion Rate</span>
              <span className="font-medium">{conversionRate}%</span>
            </div>
            <Progress value={conversionRate} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{activeLeads.length}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{convertedLeads.length}</div>
                <div className="text-xs text-muted-foreground">Converted</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{lostLeads.length}</div>
                <div className="text-xs text-muted-foreground">Lost</div>
              </div>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Lead Quality
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Average Score</span>
              <span className="font-medium">{averageScore}/100</span>
            </div>
            <Progress value={averageScore} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {myLeads.filter(l => l.score >= 80).length}
                </div>
                <div className="text-xs text-muted-foreground">High Quality</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {myLeads.filter(l => l.score < 80 && l.score >= 60).length}
                </div>
                <div className="text-xs text-muted-foreground">Medium Quality</div>
              </div>
            </div>
          </div>
        </EnhancedCard>
      </div>

      {/* Lead Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active ({activeLeads.length})</TabsTrigger>
            <TabsTrigger value="converted">Converted ({convertedLeads.length})</TabsTrigger>
            <TabsTrigger value="lost">Lost ({lostLeads.length})</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns?.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          {getFilteredLeads(activeLeads).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredLeads(activeLeads).map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No active leads</h3>
              <p className="text-muted-foreground mb-4">
                {campaignFilter !== 'all' 
                  ? 'No active leads for selected campaign' 
                  : 'Start by adding your first lead'}
              </p>
              <Button onClick={() => navigate('/leads/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Lead
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="converted" className="space-y-4">
          {getFilteredLeads(convertedLeads).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredLeads(convertedLeads).map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">No converted leads yet</h3>
              <p className="text-muted-foreground">
                Converted leads will appear here
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lost" className="space-y-4">
          {getFilteredLeads(lostLeads).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredLeads(lostLeads).map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">No lost leads</h3>
              <p className="text-muted-foreground">
                Great! You haven't lost any leads yet
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
