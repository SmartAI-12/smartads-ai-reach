import React, { useState } from 'react';
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Building, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingState } from '@/components/ui/loading';
import { useClients, Client } from '@/hooks/useClients';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { DataTable, Column } from '@/components/ui/data-table';
import { MobileCardList, MobileCardItem } from '@/components/ui/mobile-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { SwipeActions } from '@/components/ui/swipe-actions';
import { ColumnManager } from '@/components/ui/column-manager';

export const ClientsList: React.FC = () => {
  const { data: clients, isLoading, refetch } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['name', 'contact', 'address', 'status', 'created_at', 'actions']);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return <LoadingState>Loading clients...</LoadingState>;
  }

  const filteredClients = clients?.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && client.is_active) ||
                         (statusFilter === 'inactive' && !client.is_active);
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Search and filter configuration
  const searchFilters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ];

  const activeFilters = { status: statusFilter };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const exportData = () => {
    const csv = filteredClients.map(client => ({
      Name: client.name,
      'Contact Person': client.contact_person || '',
      Email: client.email || '',
      Phone: client.phone || '',
      Address: client.address || '',
      Status: client.is_active ? 'Active' : 'Inactive',
      Created: new Date(client.created_at).toLocaleDateString()
    }));
    
    const csvContent = [
      Object.keys(csv[0] || {}).join(','),
      ...csv.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // DataTable columns configuration
  const allColumns: Column<Client>[] = [
    {
      key: 'name',
      title: 'Client',
      sortable: true,
      render: (_value, client) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            <span className="font-medium">{client.name}</span>
          </div>
          {client.contact_person && (
            <p className="text-sm text-muted-foreground">
              Contact: {client.contact_person}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Contact Info',
      render: (_value, client) => (
        <div className="space-y-1">
          {client.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              <span>{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'address',
      title: 'Address',
      render: (value) => value ? (
        <span className="text-sm line-clamp-2">{value as string}</span>
      ) : (
        <span className="text-muted-foreground">No address</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '120px',
      render: (_value, client) => (
        <Badge variant={client.is_active ? 'default' : 'secondary'}>
          {client.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      title: 'Added',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="text-sm">
          {new Date(value as string).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      title: '',
      width: '60px',
      render: (_value, client) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const columns = allColumns.filter(col => visibleColumns.includes(col.key));

  // Mobile card items configuration
  const mobileItems: MobileCardItem[] = filteredClients.map(client => ({
    id: client.id,
    title: client.name,
    subtitle: client.contact_person || undefined,
    status: {
      label: client.is_active ? 'Active' : 'Inactive',
      variant: client.is_active ? 'default' : 'secondary'
    },
    metadata: [
      ...(client.email ? [{ label: 'Email', value: client.email, icon: Mail }] : []),
      ...(client.phone ? [{ label: 'Phone', value: client.phone, icon: Phone }] : []),
      ...(client.address ? [{ label: 'Address', value: client.address }] : []),
      { label: 'Added', value: new Date(client.created_at).toLocaleDateString() }
    ],
    actions: [
      {
        label: 'View Details',
        onClick: () => navigate(`/clients/${client.id}`),
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
            Clients
          </h1>
          <p className="text-muted-foreground">
            Manage your client portfolio and relationships
          </p>
        </div>
        <Button onClick={() => navigate('/clients/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Client
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
        placeholder="Search clients by name, email, or contact person..."
      />

      {/* Clients Data Display */}
      <PullToRefresh onRefresh={handleRefresh}>
        {isMobile ? (
          <MobileCardList
            items={mobileItems}
            loading={isLoading}
            onItemClick={(id) => navigate(`/clients/${id}`)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <ColumnManager
                columns={allColumns.map(col => ({
                  key: col.key,
                  title: col.title,
                  visible: visibleColumns.includes(col.key),
                  required: col.key === 'name'
                }))}
                onColumnToggle={(key, visible) => {
                  if (visible) {
                    setVisibleColumns(prev => [...prev, key]);
                  } else {
                    setVisibleColumns(prev => prev.filter(col => col !== key));
                  }
                }}
                onReset={() => setVisibleColumns(['name', 'contact', 'address', 'status', 'created_at', 'actions'])}
              />
            </div>
            <DataTable
              data={filteredClients}
              columns={columns}
              title="Clients"
              loading={isLoading}
              emptyMessage="No clients found matching your criteria"
              emptyAction={{
                label: "Add Your First Client",
                onClick: () => navigate('/clients/create'),
                icon: Plus
              }}
            />
          </div>
        )}
      </PullToRefresh>
    </div>
  );
};