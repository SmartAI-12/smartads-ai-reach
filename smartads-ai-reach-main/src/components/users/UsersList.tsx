import React, { useState } from 'react';
import { UserPlus, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { DataTable, Column } from '@/components/ui/data-table';
import { MobileCardList, MobileCardItem } from '@/components/ui/mobile-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { ColumnManager, ColumnDefinition } from '@/components/ui/column-manager';
import { AdvancedFilters, FilterDefinition } from '@/components/ui/advanced-filters';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { SwipeActions } from '@/components/ui/swipe-actions';

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'executive';
  is_active: boolean;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

const UsersList: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'executive' as 'admin' | 'manager' | 'executive',
    phone: ''
  });
  const [visibleColumns, setVisibleColumns] = useState<ColumnDefinition[]>([
    { key: 'user', title: 'User', visible: true, required: true },
    { key: 'role', title: 'Role', visible: true },
    { key: 'phone', title: 'Phone', visible: true },
    { key: 'created_at', title: 'Added', visible: true },
    { key: 'actions', title: 'Actions', visible: true }
  ]);
  const isMobile = useIsMobile();

  // Fetch users
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as User[];
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          user_id: crypto.randomUUID(), // Temporary - would be from auth
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "User created successfully" });
      setShowCreateDialog(false);
      setFormData({ full_name: '', email: '', role: 'executive', phone: '' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating user",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
        })
        .eq('id', userData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
      setFormData({ full_name: '', email: '', role: 'executive', phone: '' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating user",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: `User ${isActive ? 'deactivated' : 'activated'} successfully`
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating user status",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone || ''
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'executive': return 'secondary';
      default: return 'secondary';
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Search and filter configuration
  const searchFilters = [
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'executive', label: 'Executive' }
      ]
    }
  ];

  const handleFilterChange = (key: string, value: string) => {
    // Additional filter logic can be added here
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  const exportData = () => {
    const visibleData = filteredUsers.map(user => {
      const data: any = {};
      visibleColumns.forEach(col => {
        if (col.visible) {
          switch (col.key) {
            case 'user': data.Name = user.full_name; data.Email = user.email; break;
            case 'role': data.Role = user.role; break;
            case 'phone': data.Phone = user.phone || ''; break;
            case 'created_at': data.Created = new Date(user.created_at).toLocaleDateString(); break;
          }
        }
      });
      data.Status = user.is_active ? 'Active' : 'Inactive';
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
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Advanced filters configuration
  const advancedFilters: FilterDefinition[] = [
    {
      key: 'status',
      label: 'User Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active Users' },
        { value: 'inactive', label: 'Inactive Users' }
      ]
    },
    {
      key: 'created_range',
      label: 'Created Date',
      type: 'daterange'
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
  const allColumns: Column<User>[] = [
    {
      key: 'user',
      title: 'User',
      sortable: true,
      render: (user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
            <AvatarFallback>
              {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{user.full_name}</span>
              {!user.is_active && (
                <Badge variant="outline" className="text-xs">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      width: '120px',
      render: (user) => (
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (user) => user.phone || (
        <span className="text-muted-foreground">No phone</span>
      )
    },
    {
      key: 'created_at',
      title: 'Added',
      sortable: true,
      width: '120px',
      render: (user) => (
        <span className="text-sm">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      title: '',
      width: '60px',
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditDialog(user)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => toggleStatusMutation.mutate({ userId: user.id, isActive: user.is_active })}
              disabled={toggleStatusMutation.isPending}
            >
              {user.is_active ? 'Deactivate' : 'Activate'}
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
  const mobileItems: MobileCardItem[] = filteredUsers.map(user => ({
    id: user.id,
    title: user.full_name,
    subtitle: user.email,
    status: {
      label: user.role.charAt(0).toUpperCase() + user.role.slice(1),
      variant: getRoleBadgeVariant(user.role)
    },
    metadata: [
      ...(user.phone ? [{ label: 'Phone', value: user.phone }] : []),
      { label: 'Added', value: new Date(user.created_at).toLocaleDateString() },
      { label: 'Status', value: user.is_active ? 'Active' : 'Inactive', variant: user.is_active ? 'default' : 'secondary' }
    ],
    actions: [
      {
        label: 'Edit',
        onClick: () => openEditDialog(user),
        variant: 'outline'
      },
      {
        label: user.is_active ? 'Deactivate' : 'Activate',
        onClick: () => toggleStatusMutation.mutate({ userId: user.id, isActive: user.is_active }),
        variant: user.is_active ? 'destructive' : 'default'
      }
    ]
  }));

  // Check if user has admin privileges
  const canManageUsers = profile?.role === 'admin';

  if (!canManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access user management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full mb-6" />
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage team members and their roles</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new team member to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createUserMutation.mutate(formData)}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Global Search */}
      <GlobalSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={searchFilters}
        activeFilters={{}}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onExport={exportData}
        placeholder="Search users by name, email, or role..."
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

      {/* Users Data Display */}
      {isMobile ? (
        <PullToRefresh onRefresh={async () => { await refetch(); }}>
          <SwipeActions>
            <MobileCardList
              items={mobileItems}
              loading={isLoading}
              onItemClick={(id) => {
                const user = filteredUsers.find(u => u.id === id);
                if (user) openEditDialog(user);
              }}
            />
          </SwipeActions>
        </PullToRefresh>
      ) : (
        <DataTable
          data={filteredUsers}
          columns={columns}
          title="Users"
          loading={isLoading}
          emptyMessage="No users found matching your search"
        />
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => editingUser && updateUserMutation.mutate({ ...formData, id: editingUser.id })}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersList;