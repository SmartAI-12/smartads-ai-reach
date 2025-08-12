import React, { useState, useRef, ChangeEvent } from 'react';
import { UserPlus, Edit, MoreHorizontal, Upload, Clock, Activity, BarChart2, Calendar, Briefcase, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
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

// Database user type (matches the database schema)
type DatabaseUser = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'executive';
  is_active: boolean;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
  last_activity_at?: string;
  login_count?: number;
  metadata?: any;
};

// Extended user type for the UI
interface User extends Omit<DatabaseUser, 'role' | 'metadata'> {
  role: 'admin' | 'manager' | 'executive' | 'client' | 'vendor';
  metadata?: {
    department?: string;
    position?: string;
    join_date?: string;
  };
  activity_metrics?: {
    tasks_completed?: number;
    campaigns_managed?: number;
    last_active_campaign?: string;
  };
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
    role: 'executive' as 'admin' | 'manager' | 'executive' | 'client' | 'vendor',
    phone: '',
    department: '',
    position: '',
    join_date: new Date().toISOString().split('T')[0]
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      
      // Transform database users to our extended User type
      return (data as DatabaseUser[]).map(user => ({
        ...user,
        role: user.role as User['role'], // This will include our extended roles
        metadata: user.metadata || {},
        activity_metrics: {
          tasks_completed: 0,
          campaigns_managed: 0,
          ...(user as any).activity_metrics
        }
      })) as User[];
    },
  });

  // Upload avatar to storage
  const uploadAvatar = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      let avatarUrl = null;
      
      // Upload avatar if exists
      if (avatarFile) {
        avatarUrl = await uploadAvatar(crypto.randomUUID(), avatarFile);
      }

      // Prepare user data for database
      const dbUser = {
        user_id: crypto.randomUUID(),
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role as DatabaseUser['role'], // Cast to database role type
        phone: userData.phone,
        avatar_url: avatarUrl,
        is_active: true,
        metadata: {
          department: userData.department,
          position: userData.position,
          join_date: userData.join_date
        },
        last_login_at: null,
        last_activity_at: null,
        login_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .insert([dbUser]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "User created successfully" });
      setShowCreateDialog(false);
      setFormData({ 
        full_name: '', 
        email: '', 
        role: 'executive', 
        phone: '',
        department: '',
        position: '',
        join_date: new Date().toISOString().split('T')[0]
      });
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
      let avatarUrl = avatarPreview?.startsWith('blob:') ? await uploadAvatar(userData.id, avatarFile!) : avatarPreview || null;
      
      // Prepare update data
      const updateData = {
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role as DatabaseUser['role'], // Cast to database role type
        phone: userData.phone,
        avatar_url: avatarUrl,
        metadata: {
          department: userData.department,
          position: userData.position,
          join_date: userData.join_date
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
      setFormData({ 
        full_name: '', 
        email: '', 
        role: 'executive', 
        phone: '',
        department: '',
        position: '',
        join_date: new Date().toISOString().split('T')[0]
      });
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      department: user.metadata?.department || '',
      position: user.metadata?.position || '',
      join_date: user.metadata?.join_date || new Date().toISOString().split('T')[0]
    });
    if (user.avatar_url) {
      setAvatarPreview(user.avatar_url);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'executive': return 'secondary';
      case 'client': return 'outline';
      case 'vendor': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
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
        <div className="flex flex-col">
          <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit">
            {getRoleDisplayName(user.role)}
          </Badge>
          {user.metadata?.department && (
            <span className="text-xs text-muted-foreground">{user.metadata.department}</span>
          )}
        </div>
      )
    },
    {
      key: 'activity',
      title: 'Activity',
      width: '180px',
      render: (user) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center text-sm">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {user.last_login_at ? `Last login: ${formatLastActivity(user.last_login_at)}` : 'Never logged in'}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Activity className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {user.last_activity_at ? `Active ${formatLastActivity(user.last_activity_at)}` : 'No activity'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'metrics',
      title: 'Metrics',
      width: '160px',
      render: (user) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center text-sm">
            <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {user.activity_metrics?.tasks_completed || 0} tasks
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {user.activity_metrics?.campaigns_managed || 0} campaigns
            </span>
          </div>
        </div>
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

  // Reset form when dialog is closed
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setShowCreateDialog(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setFormData({
        full_name: '',
        email: '',
        role: 'executive',
        phone: '',
        department: '',
        position: '',
        join_date: new Date().toISOString().split('T')[0]
      });
    }
  };

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
      </div>
        
        <Dialog open={showCreateDialog} onOpenChange={handleDialogOpenChange}>
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
              <div className="flex flex-col items-center mb-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 mb-2 cursor-pointer" onClick={triggerFileInput}>
                    <AvatarImage src={avatarPreview || ''} />
                    <AvatarFallback className="text-2xl">
                      {formData.full_name ? formData.full_name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </Avatar>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={triggerFileInput}
                  className="text-sm text-muted-foreground"
                >
                  Change photo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Enter position"
                  />
                </div>
                <div>
                  <Label htmlFor="join_date">Join Date</Label>
                  <Input
                    id="join_date"
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, join_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
      <Dialog 
        open={!!editingUser} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
            setAvatarFile(null);
            setAvatarPreview(null);
          }
        }}
      >
      
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 mb-2 cursor-pointer" onClick={triggerFileInput}>
                  <AvatarImage src={avatarPreview || ''} />
                  <AvatarFallback className="text-2xl">
                    {formData.full_name ? formData.full_name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={triggerFileInput}
                className="text-sm text-muted-foreground"
              >
                Change photo
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department"
                />
              </div>
              <div>
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Enter position"
                />
              </div>
              <div>
                <Label htmlFor="edit-join_date">Join Date</Label>
                <Input
                  id="edit-join_date"
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, join_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setEditingUser(null)}
                disabled={updateUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => editingUser && updateUserMutation.mutate({ ...formData, id: editingUser.id })}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
);
};

export default UsersList;