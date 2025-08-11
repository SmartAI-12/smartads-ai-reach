import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star, Phone, Mail, User, Edit, MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Skeleton } from '@/components/ui/skeleton';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { DataTable, Column } from '@/components/ui/data-table';
import { MobileCardList, MobileCardItem } from '@/components/ui/mobile-card';
import { ColumnManager, ColumnDefinition } from '@/components/ui/column-manager';
import { AdvancedFilters, FilterDefinition } from '@/components/ui/advanced-filters';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { SwipeActions } from '@/components/ui/swipe-actions';
import { useIsMobile } from '@/hooks/use-mobile';

const statusColors = {
  new: 'bg-blue-500/10 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  qualified: 'bg-green-500/10 text-green-700 border-green-200',
  converted: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  lost: 'bg-red-500/10 text-red-700 border-red-200',
};

const LeadsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [visibleColumns, setVisibleColumns] = useState<ColumnDefinition[]>([
    { key: 'name', title: 'Name', visible: true, required: true },
    { key: 'contact', title: 'Contact', visible: true },
    { key: 'status', title: 'Status', visible: true },
    { key: 'score', title: 'Score', visible: true },
    { key: 'campaign', title: 'Campaign', visible: true },
    { key: 'source', title: 'Source', visible: true },
    { key: 'created', title: 'Created', visible: true },
    { key: 'actions', title: 'Actions', visible: true }
  ]);
  const isMobile = useIsMobile();

  const { data: leads = [], isLoading, refetch } = useLeads();
  const { data: campaigns = [] } = useCampaigns();
  const updateLeadMutation = useUpdateLead();

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesCampaign = campaignFilter === 'all' || lead.campaign_id === campaignFilter;
    
    return matchesSearch && matchesStatus && matchesCampaign;
  });

  const handleStatusUpdate = (leadId: string, status: string) => {
    updateLeadMutation.mutate({
      id: leadId,
      status: status as any,
      converted_at: status === 'converted' ? new Date().toISOString() : null
    });
  };

  const searchFilters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'converted', label: 'Converted' },
        { value: 'lost', label: 'Lost' }
      ]
    },
    {
      key: 'campaign',
      label: 'Campaign',
      options: campaigns.map(campaign => ({ value: campaign.id, label: campaign.name }))
    }
  ];

  const activeFilters = { status: statusFilter, campaign: campaignFilter };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') setStatusFilter(value);
    if (key === 'campaign') setCampaignFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCampaignFilter('all');
  };

  const exportData = () => {
    const visibleData = filteredLeads.map(lead => {
      const data: any = {};
      visibleColumns.forEach(col => {
        if (col.visible) {
          switch (col.key) {
            case 'name': data.Name = lead.name; break;
            case 'contact': data.Email = lead.email || ''; data.Phone = lead.phone || ''; break;
            case 'status': data.Status = lead.status; break;
            case 'score': data.Score = lead.score; break;
            case 'campaign': data.Campaign = lead.campaigns?.name || ''; break;
            case 'source': data.Source = lead.source || ''; break;
            case 'created': data.Created = new Date(lead.created_at).toLocaleDateString(); break;
          }
        }
      });
      return data;
    });
    
    const csvContent = [
      Object.keys(visibleData[0] || {}).join(','),
      ...visibleData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Advanced filters configuration
  const advancedFilters: FilterDefinition[] = [
    {
      key: 'score_range',
      label: 'Score Range',
      type: 'number',
      placeholder: 'Min score'
    },
    {
      key: 'date_range',
      label: 'Creation Date',
      type: 'daterange'
    },
    {
      key: 'has_phone',
      label: 'Has Phone',
      type: 'select',
      options: [
        { value: 'yes', label: 'Has Phone Number' },
        { value: 'no', label: 'No Phone Number' }
      ]
    }
  ];

  const handleColumnToggle = (key: string, visible: boolean) => {
    setVisibleColumns(cols => 
      cols.map(col => col.key === key ? { ...col, visible } : col)
    );
  };

  const resetColumns = () => {
    setVisibleColumns(cols => cols.map(col => ({ ...col, visible: true })));
  };

  // DataTable columns configuration
  const allColumns: Column<any>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (lead) => (
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{lead.name}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>{lead.score}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (lead) => (
        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '150px',
      render: (lead) => (
        <div className="space-y-2">
          <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
            {lead.status}
          </Badge>
          <Select 
            onValueChange={(value) => handleStatusUpdate(lead.id, value)}
            disabled={updateLeadMutation.isPending}
          >
            <SelectTrigger className="w-24 h-6 text-xs">
              <SelectValue placeholder="Update" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      key: 'campaign',
      title: 'Campaign',
      sortable: true,
      render: (lead) => lead.campaigns?.name || <span className="text-muted-foreground">No campaign</span>
    },
    {
      key: 'source',
      title: 'Source',
      render: (lead) => lead.source || <span className="text-muted-foreground">No source</span>
    },
    {
      key: 'created',
      title: 'Created',
      sortable: true,
      width: '120px',
      render: (lead) => (
        <div className="text-sm">
          {new Date(lead.created_at).toLocaleDateString()}
          {lead.converted_at && (
            <div className="text-xs text-green-600">
              Converted {new Date(lead.converted_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: '',
      width: '60px',
      render: (lead) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const columns = allColumns.filter(col => 
    visibleColumns.find(vc => vc.key === col.key)?.visible
  );

  // Mobile card items configuration
  const mobileItems: MobileCardItem[] = filteredLeads.map(lead => ({
    id: lead.id,
    title: lead.name,
    subtitle: lead.email || lead.phone || 'No contact info',
    status: {
      label: lead.status,
      variant: lead.status === 'converted' ? 'default' : 
               lead.status === 'lost' ? 'destructive' : 'secondary'
    },
    metadata: [
      { label: 'Score', value: lead.score.toString() },
      { label: 'Campaign', value: lead.campaigns?.name || 'No campaign' },
      ...(lead.source ? [{ label: 'Source', value: lead.source }] : []),
      { label: 'Created', value: new Date(lead.created_at).toLocaleDateString() }
    ],
    actions: [
      {
        label: 'View',
        onClick: () => navigate(`/leads/${lead.id}`),
        variant: 'outline'
      },
      {
        label: 'Edit',
        onClick: () => navigate(`/leads/${lead.id}/edit`),
        variant: 'default'
      }
    ]
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">Track and manage your leads</p>
        </div>
        <Button onClick={() => navigate('/leads/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Global Search */}
      <GlobalSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={searchFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onExport={exportData}
        placeholder="Search leads by name, email, or phone..."
      />

      {/* Advanced Features */}
      <div className="flex flex-wrap gap-2">
        <AdvancedFilters
          filters={advancedFilters}
          values={{}}
          onChange={() => {}}
          onClear={() => {}}
        />
        {!isMobile && (
          <ColumnManager
            columns={visibleColumns}
            onColumnToggle={handleColumnToggle}
            onReset={resetColumns}
          />
        )}
      </div>

      {/* Data Display */}
      {isMobile ? (
        <SwipeActions>
          <MobileCardList
            items={mobileItems}
            loading={isLoading}
            onItemClick={(id) => navigate(`/leads/${id}`)}
          />
        </SwipeActions>
      ) : (
        <DataTable
          data={filteredLeads}
          columns={columns}
          title="Leads"
          loading={isLoading}
          emptyMessage="No leads found matching your criteria"
        />
      )}

      {filteredLeads.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No leads found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' || campaignFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Start by creating your first lead'}
          </p>
          {!searchTerm && statusFilter === 'all' && campaignFilter === 'all' && (
            <Button onClick={() => navigate('/leads/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Lead
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <PullToRefresh onRefresh={async () => { await refetch(); }}>
      {content}
    </PullToRefresh>
  ) : content;
};

export default LeadsList;