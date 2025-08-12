import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, DollarSign, Users, Eye, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVendorCampaigns } from '@/hooks/useVendorCampaigns';
import { LoadingState } from '@/components/ui/loading';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { DataTable, Column } from '@/components/ui/data-table';
import { MobileCardList, MobileCardItem } from '@/components/ui/mobile-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';

export const VendorCampaignsList: React.FC = () => {
  const { data: campaigns = [], isLoading, refetch } = useVendorCampaigns();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    status: 'all',
    budget: 'all'
  });
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isLoading) {
    return <LoadingState>Loading your campaigns...</LoadingState>;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusCount = (tasks: any[] = []) => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    return { completed, pending, inProgress, total: tasks.length };
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Campaigns</h1>
            <p className="text-gray-600">Campaigns assigned to you</p>
          </div>
        </div>

        <GlobalSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search campaigns..."
          filters={searchFilters}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        <PullToRefresh onRefresh={handleRefresh}>
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => {
              const taskStats = getTaskStatusCount(campaign.tasks);
              return (
                <div key={campaign.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.clients?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline">
                        {taskStats.total} tasks
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{campaign.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Start: {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>Budget: {campaign.budget ? `$${campaign.budget.toLocaleString()}` : 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Completed: {taskStats.completed}/{taskStats.total}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>In Progress: {taskStats.inProgress}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </PullToRefresh>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns assigned</h3>
            <p className="text-gray-600">You don't have any campaigns assigned to you yet.</p>
          </div>
        )}
      </div>
    );
  }

  const columns: Column<any>[] = [
    {
      key: 'name',
      title: 'Campaign Name',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.clients?.name}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, row) => (
        <Badge className={getStatusColor(row.status)}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'tasks',
      title: 'Tasks',
      render: (_, row) => {
        const taskStats = getTaskStatusCount(row.tasks);
        return (
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{taskStats.completed} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span>{taskStats.inProgress} in progress</span>
            </div>
            <div className="text-gray-500">Total: {taskStats.total}</div>
          </div>
        );
      },
    },
    {
      key: 'budget',
      title: 'Budget',
      render: (_, row) => (
        <div className="text-sm">
          {row.budget ? `$${row.budget.toLocaleString()}` : 'Not set'}
        </div>
      ),
    },
    {
      key: 'dates',
      title: 'Timeline',
      render: (_, row) => (
        <div className="text-sm">
          <div>Start: {row.start_date ? new Date(row.start_date).toLocaleDateString() : 'Not set'}</div>
          <div>End: {row.end_date ? new Date(row.end_date).toLocaleDateString() : 'Not set'}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/campaigns/${row.id}`)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/campaigns/${row.id}/tasks`)}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              View Tasks
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
          <p className="text-gray-600">Campaigns assigned to you for execution</p>
        </div>
      </div>

      <GlobalSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search campaigns..."
        filters={searchFilters}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <DataTable
          data={filteredCampaigns}
          columns={columns}
        />
      </PullToRefresh>

      {filteredCampaigns.length === 0 && (
        <EnhancedCard>
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns assigned</h3>
            <p className="text-gray-600">You don't have any campaigns assigned to you yet.</p>
          </div>
        </EnhancedCard>
      )}
    </div>
  );
};
