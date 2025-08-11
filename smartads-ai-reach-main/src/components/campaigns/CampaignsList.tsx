import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Calendar, DollarSign, Users, Eye, Edit, Trash2, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '@/hooks/useCampaigns';
import { LoadingState } from '@/components/ui/loading';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { DataTable, Column } from '@/components/ui/data-table';
import { MobileCardList, MobileCardItem } from '@/components/ui/mobile-card';
import { useIsMobile } from '@/hooks/use-mobile';

export const CampaignsList: React.FC = () => {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    status: 'all',
    budget: 'all'
  });
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isLoading) {
    return <LoadingState>Loading campaigns...</LoadingState>;
  }

  const filteredCampaigns = (campaigns || []).filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.target_audience?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || campaign.status === filters.status;
    
    const matchesBudget = filters.budget === 'all' || (() => {
      const budget = Number(campaign.budget) || 0;
      switch (filters.budget) {
        case 'low': return budget < 10000;
        case 'medium': return budget >= 10000 && budget <= 50000;
        case 'high': return budget > 50000;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesBudget;
  }) || [];

  const searchFilters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'paused', label: 'Paused' },
        { value: 'completed', label: 'Completed' }
      ]
    },
    {
      key: 'budget',
      label: 'Budget Range',
      options: [
        { value: 'low', label: 'Under $10K' },
        { value: 'medium', label: '$10K - $50K' },
        { value: 'high', label: 'Over $50K' }
      ]
    }
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: 'all', budget: 'all' });
    setSearchTerm('');
  };

  const exportData = () => {
    const csvData = filteredCampaigns.map((campaign) => ({
      Name: campaign.name,
      Status: campaign.status,
      Budget: campaign.budget,
      'Start Date': campaign.start_date,
      'End Date': campaign.end_date,
      Description: campaign.description
    }));
    
    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaigns.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'paused':
        return 'outline';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // DataTable columns configuration
  const columns: Column<any>[] = [
    {
      key: 'name',
      title: 'Campaign',
      sortable: true,
      render: (campaign) => (
        <div className="space-y-1">
          <span className="font-medium">{campaign.name}</span>
          {campaign.clients?.name && (
            <p className="text-sm text-muted-foreground">
              {campaign.clients.name}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '120px',
      render: (campaign) => {
        const status = campaign.status || 'unknown';
        return (
          <Badge variant={getStatusVariant(status)} className="w-fit">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      }
    },
    {
      key: 'budget',
      title: 'Budget',
      sortable: true,
      width: '120px',
      render: (campaign) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span>${Number(campaign.budget).toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'start_date',
      title: 'Start Date',
      sortable: true,
      width: '120px',
      render: (campaign) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'No date'}
          </span>
        </div>
      )
    },
    {
      key: 'assignee',
      title: 'Manager',
      width: '150px',
      render: (campaign) => {
        const assigneeName = campaign?.profiles?.full_name;
        return assigneeName ? (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{assigneeName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        );
      }
    },
    {
      key: 'actions',
      title: '',
      width: '60px',
      render: (campaign) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Campaign
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  // Mobile card items configuration
  const mobileItems: MobileCardItem[] = filteredCampaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.name,
    subtitle: campaign.description || undefined,
    status: {
      label: campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1),
      variant: getStatusVariant(campaign.status)
    },
    metadata: [
      { label: 'Budget', value: `$${Number(campaign.budget).toLocaleString()}`, icon: DollarSign },
      ...(campaign.start_date ? [{ 
        label: 'Start Date', 
        value: new Date(campaign.start_date).toLocaleDateString(),
        icon: Calendar
      }] : []),
      ...(campaign.profiles?.full_name ? [{ 
        label: 'Manager', 
        value: campaign.profiles.full_name, 
        icon: Users 
      }] : []),
      ...(campaign.clients?.name ? [{ label: 'Client', value: campaign.clients.name }] : [])
    ],
    actions: [
      {
        label: 'View Details',
        onClick: () => navigate(`/campaigns/${campaign.id}`),
        variant: 'outline'
      }
    ]
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Campaigns
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor your marketing campaigns
          </p>
        </div>
        <Button onClick={() => navigate('/campaigns/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Advanced Search and Filters */}
      <GlobalSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={searchFilters}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onExport={exportData}
        onClearFilters={clearFilters}
        placeholder="Search campaigns by name, description, or audience..."
      />

      {/* Campaigns Data Display */}
      {isMobile ? (
        <MobileCardList
          items={mobileItems}
          loading={isLoading}
          onItemClick={(id) => navigate(`/campaigns/${id}`)}
        />
      ) : (
        <DataTable
          data={filteredCampaigns || []}
          columns={columns}
          title="Campaigns"
          loading={isLoading}
          emptyMessage="No campaigns found matching your criteria"
          emptyAction={{
            label: "Create Campaign",
            onClick: () => navigate('/campaigns/create'),
            icon: Plus
          }}
        />
      )}
    </div>
  );
};