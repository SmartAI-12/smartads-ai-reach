import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, TrendingUp, Camera, Edit, MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useExecutionReports } from '@/hooks/useExecutionReports';
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

const ExecutionReportsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [visibleColumns, setVisibleColumns] = useState<ColumnDefinition[]>([
    { key: 'campaign', title: 'Campaign', visible: true, required: true },
    { key: 'date', title: 'Date', visible: true },
    { key: 'activities', title: 'Activities', visible: true },
    { key: 'challenges', title: 'Challenges', visible: true },
    { key: 'next_steps', title: 'Next Steps', visible: true },
    { key: 'photos', title: 'Photos', visible: true },
    { key: 'created_by', title: 'Created By', visible: true },
    { key: 'actions', title: 'Actions', visible: true }
  ]);
  const isMobile = useIsMobile();

  const { data: reports = [], isLoading, refetch } = useExecutionReports();
  const { data: campaigns = [] } = useCampaigns();

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.campaigns?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.challenges?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.next_steps?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampaign = campaignFilter === 'all' || report.campaign_id === campaignFilter;
    
    return matchesSearch && matchesCampaign;
  });

  const searchFilters = [
    {
      key: 'campaign',
      label: 'Campaign',
      options: campaigns.map(campaign => ({ value: campaign.id, label: campaign.name }))
    }
  ];

  const activeFilters = { campaign: campaignFilter };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'campaign') setCampaignFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCampaignFilter('all');
  };

  const exportData = () => {
    const visibleData = filteredReports.map(report => {
      const data: any = {};
      visibleColumns.forEach(col => {
        if (col.visible) {
          switch (col.key) {
            case 'campaign': data.Campaign = report.campaigns?.name || ''; break;
            case 'date': data.Date = new Date(report.report_date).toLocaleDateString(); break;
            case 'activities': data['Activities Completed'] = report.activities_completed?.join('; ') || ''; break;
            case 'challenges': data.Challenges = report.challenges || ''; break;
            case 'next_steps': data['Next Steps'] = report.next_steps || ''; break;
            case 'photos': data['Photos Count'] = report.photos?.length || 0; break;
            case 'created_by': data['Created By'] = report.profiles?.full_name || ''; break;
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
    a.download = 'execution-reports.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Advanced filters configuration
  const advancedFilters: FilterDefinition[] = [
    {
      key: 'date_range',
      label: 'Report Date Range',
      type: 'daterange'
    },
    {
      key: 'has_photos',
      label: 'Has Photos',
      type: 'select',
      options: [
        { value: 'yes', label: 'Has Photos' },
        { value: 'no', label: 'No Photos' }
      ]
    },
    {
      key: 'activities_count',
      label: 'Min Activities',
      type: 'number',
      placeholder: 'Minimum activities'
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
      key: 'campaign',
      title: 'Campaign',
      sortable: true,
      render: (report) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <div>
            <div className="font-medium">{report.campaigns?.name}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(report.report_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'activities',
      title: 'Activities',
      render: (report) => (
        <div className="max-w-xs">
          {report.activities_completed && report.activities_completed.length > 0 ? (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-sm font-medium">{report.activities_completed.length} completed</span>
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {report.activities_completed.slice(0, 2).join(', ')}
                {report.activities_completed.length > 2 && '...'}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">No activities</span>
          )}
        </div>
      )
    },
    {
      key: 'challenges',
      title: 'Challenges',
      render: (report) => (
        <div className="max-w-xs">
          {report.challenges ? (
            <p className="text-sm line-clamp-2">{report.challenges}</p>
          ) : (
            <span className="text-muted-foreground text-sm">No challenges</span>
          )}
        </div>
      )
    },
    {
      key: 'next_steps',
      title: 'Next Steps',
      render: (report) => (
        <div className="max-w-xs">
          {report.next_steps ? (
            <p className="text-sm line-clamp-2">{report.next_steps}</p>
          ) : (
            <span className="text-muted-foreground text-sm">No next steps</span>
          )}
        </div>
      )
    },
    {
      key: 'photos',
      title: 'Photos',
      width: '100px',
      render: (report) => (
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{report.photos?.length || 0}</span>
        </div>
      )
    },
    {
      key: 'created_by',
      title: 'Created By',
      sortable: true,
      render: (report) => (
        <div className="text-sm">
          <div className="font-medium">{report.profiles?.full_name}</div>
          <div className="text-muted-foreground">
            {new Date(report.created_at).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: '',
      width: '60px',
      render: (report) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/reports/${report.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Report
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/reports/${report.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Report
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
  const mobileItems: MobileCardItem[] = filteredReports.map(report => ({
    id: report.id,
    title: report.campaigns?.name || 'No Campaign',
    subtitle: new Date(report.report_date).toLocaleDateString(),
    status: {
      label: 'Report',
      variant: 'outline'
    },
    metadata: [
      { label: 'Activities', value: (report.activities_completed?.length || 0).toString() },
      { label: 'Photos', value: (report.photos?.length || 0).toString() },
      { label: 'Created by', value: report.profiles?.full_name || 'Unknown' },
      { label: 'Created', value: new Date(report.created_at).toLocaleDateString() }
    ],
    actions: [
      {
        label: 'View',
        onClick: () => navigate(`/reports/${report.id}`),
        variant: 'outline'
      },
      {
        label: 'Edit',
        onClick: () => navigate(`/reports/${report.id}/edit`),
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <h1 className="text-3xl font-bold">Execution Reports</h1>
          <p className="text-muted-foreground">Track campaign execution progress</p>
        </div>
        <Button onClick={() => navigate('/reports/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Report
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
        placeholder="Search reports by campaign, challenges, or next steps..."
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
            onItemClick={(id) => navigate(`/reports/${id}`)}
          />
        </SwipeActions>
      ) : (
        <DataTable
          data={filteredReports}
          columns={columns}
          title="Execution Reports"
          loading={isLoading}
          emptyMessage="No execution reports found matching your criteria"
        />
      )}

      {filteredReports.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No execution reports found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || campaignFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Start by creating your first execution report'}
          </p>
          {!searchTerm && campaignFilter === 'all' && (
            <Button onClick={() => navigate('/reports/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Report
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

export default ExecutionReportsList;