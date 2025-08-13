import React, { useState, useRef, ChangeEvent } from 'react';
import { UserPlus, Edit, MoreHorizontal, Upload, Clock, Activity, BarChart2, Calendar, Briefcase, Building2, Shield, UserX, Eye, TrendingUp, Users, AlertTriangle } from 'lucide-react';
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
  role: 'admin' | 'manager' | 'executive' | 'vendor'; // Only roles that exist in database
  metadata?: {
    department?: string;
    position?: string;
    join_date?: string;
    permissions?: string[];
    last_password_change?: string;
  };
  activity_metrics?: {
    tasks_completed?: number;
    campaigns_managed?: number;
    last_active_campaign?: string;
    total_logins?: number;
    avg_session_duration?: number;
    performance_score?: number;
    engagement_level?: 'high' | 'medium' | 'low';
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
    role: 'executive' as 'admin' | 'manager' | 'executive' | 'vendor',
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
    { key: 'status', title: 'Status', visible: true },
    { key: 'phone', title: 'Phone', visible: true },
    { key: 'department', title: 'Department', visible: true },
    { key: 'last_activity', title: 'Last Activity', visible: true },
    { key: 'performance', title: 'Performance', visible: false },
    { key: 'metrics', title: 'Metrics', visible: false },
    { key: 'created_at', title: 'Added', visible: true },
    { key: 'actions', title: 'Actions', visible: true }
  ]);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [selectedUserActivity, setSelectedUserActivity] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<User | null>(null);
  const isMobile = useIsMobile();

  // Fetch users
  const { data: users = [], isLoading, refetch, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users from database...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Raw user data from database:', data);
      
      // Transform database users to our extended User type
      const transformedUsers = (data as DatabaseUser[]).map(user => ({
        ...user,
        role: user.role as User['role'] || 'executive', // Only use roles that exist in DB: admin, manager, executive, vendor
        metadata: {
          department: 'Marketing', // Sample department
          position: user.role === 'admin' ? 'System Administrator' : 
                   user.role === 'manager' ? 'Campaign Manager' : 'Executive',
          join_date: user.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          permissions: [],
          last_password_change: user.updated_at
        },
        activity_metrics: {
          tasks_completed: Math.floor(Math.random() * 20),
          campaigns_managed: Math.floor(Math.random() * 5),
          last_active_campaign: 'Retail Rush Campaign',
          total_logins: Math.floor(Math.random() * 50) + 10,
          avg_session_duration: Math.floor(Math.random() * 120) + 30,
          performance_score: Math.floor(Math.random() * 40) + 60, // 60-100 range
          engagement_level: Math.random() > 0.6 ? 'high' as const : Math.random() > 0.3 ? 'medium' as const : 'low' as const
        },
        // Mock missing fields for demo purposes
        last_login_at: user.updated_at,
        last_activity_at: user.updated_at,
        login_count: Math.floor(Math.random() * 50) + 5
      })) as User[];
      
      console.log('Transformed user data:', transformedUsers);
      return transformedUsers;
    },
    retry: 3,
    retryDelay: 1000,
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

  const filteredUsers = users.filter(user => {
    // Safety check: ensure user object exists and has essential properties
    if (!user || !user.full_name || !user.email) {
      return false;
    }
    
    return (
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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

  const handleDialogOpenChange = (open: boolean) => {
    setShowCreateDialog(open);
    if (!open) {
      setFormData({
        full_name: '',
        email: '',
        role: 'executive',
        phone: '',
        department: '',
        position: '',
        join_date: new Date().toISOString().split('T')[0]
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    }
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
      render: (user) => {
        if (!user || !user.full_name) return <div>Loading...</div>;
        
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
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
        );
      }
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      width: '120px',
      render: (user) => {
        if (!user || !user.role) return <div>Loading...</div>;
        
        return (
          <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit">
            {getRoleDisplayName(user.role)}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '100px',
      render: (user) => {
        if (!user) return <div>Loading...</div>;
        
        return (
          <Badge variant={user.is_active ? 'default' : 'secondary'}>
            {user.is_active ? 'Active' : 'Inactive'}
          </Badge>
        );
      }
    },
    {
      key: 'department',
      title: 'Department',
      sortable: true,
      width: '140px',
      render: (user) => {
        if (!user) return <div>Loading...</div>;
        
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.metadata?.department || 'Not assigned'}</span>
            {user.metadata?.position && (
              <span className="text-xs text-muted-foreground">{user.metadata.position}</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'last_activity',
      title: 'Last Activity',
      sortable: true,
      width: '140px',
      render: (user) => {
        if (!user) return <div>Loading...</div>;
        
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm">
              {user.last_activity_at 
                ? formatLastActivity(user.last_activity_at)
                : 'No activity'
              }
            </span>
            {user.last_login_at && (
              <span className="text-xs text-muted-foreground">
                Login: {formatLastActivity(user.last_login_at)}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'performance',
      title: 'Performance',
      sortable: true,
      width: '120px',
      render: (user) => {
        if (!user) return <div>Loading...</div>;
        
        const score = user.activity_metrics?.performance_score || 0;
        const engagement = user.activity_metrics?.engagement_level || 'low';
        
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{score}%</span>
              <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    score >= 80 ? 'bg-green-500' : 
                    score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
            <Badge variant={engagement === 'high' ? 'default' : engagement === 'medium' ? 'secondary' : 'outline'} className="text-xs">
              {engagement}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'login_count',
      title: 'Logins',
      sortable: true,
      width: '80px',
      render: (user) => {
        if (!user) return <div>Loading...</div>;
        
        return (
          <div className="text-center">
            <div className="text-lg font-bold">{user.login_count || 0}</div>
            <div className="text-xs text-muted-foreground">total</div>
          </div>
        );
      }
    },
    {
      key: 'activity',
      title: 'Activity',
      width: '180px',
      render: (user) => {
        if (!user) return <div>Loading...</div>;
        
        return (
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
        );
      }
    },
    {
      key: 'metrics',
      title: 'Metrics',
      width: '160px',
      render: (user) => {
        if (!user) return <div>Loading...</div>;
        
        return (
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
        );
      }
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (user) => {
        if (!user) return <div>Loading...</div>;
        
        return user.phone || (
          <span className="text-muted-foreground">No phone</span>
        );
      }
    },
    {
      key: 'created_at',
      title: 'Added',
      sortable: true,
      width: '120px',
      render: (user) => {
        if (!user || !user.created_at) return <div>Loading...</div>;
        
        return (
          <span className="text-sm">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: '',
      width: '60px',
      render: (user) => {
        if (!user || !user.id) return <div>Loading...</div>;
        
        return (
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
              <DropdownMenuItem onClick={() => {
                setSelectedUserActivity(user);
                setShowActivityDialog(true);
              }}>
                <Activity className="h-4 w-4 mr-2" />
                View Activity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedUserRole(user);
                setShowRoleDialog(true);
              }}>
                <Shield className="h-4 w-4 mr-2" />
                Manage Role
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => toggleStatusMutation.mutate({ userId: user.id, isActive: user.is_active })}
                disabled={toggleStatusMutation.isPending}
                className={user.is_active ? "text-destructive" : "text-green-600"}
              >
                {user.is_active ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
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
  const canManageUsers = profile?.role === 'admin' || profile?.role === 'manager';

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
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your search
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
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
                        {user.phone && (
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm">{user.metadata?.department || 'Marketing'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatLastActivity(user.last_activity_at)}
                        </p>
                      </div>
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
                          <DropdownMenuItem onClick={() => {
                            setSelectedUserActivity(user);
                            setShowActivityDialog(true);
                          }}>
                            <Activity className="h-4 w-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUserRole(user);
                            setShowRoleDialog(true);
                          }}>
                            <Shield className="h-4 w-4 mr-2" />
                            Manage Role
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleStatusMutation.mutate({ userId: user.id, isActive: user.is_active })}
                            disabled={toggleStatusMutation.isPending}
                            className={user.is_active ? "text-destructive" : "text-green-600"}
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Users className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* Activity Monitoring Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Activity & Performance - {selectedUserActivity?.full_name}
            </DialogTitle>
            <DialogDescription>
              Comprehensive activity monitoring and performance metrics
            </DialogDescription>
          </DialogHeader>
          
          {selectedUserActivity && (
            <div className="space-y-6">
              {/* Activity Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Login Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {selectedUserActivity.login_count || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Logins</p>
                      <div className="text-sm">
                        Last: {selectedUserActivity.last_login_at 
                          ? format(new Date(selectedUserActivity.last_login_at), 'MMM dd, yyyy HH:mm')
                          : 'Never'
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {selectedUserActivity.activity_metrics?.performance_score || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Performance Score</p>
                      <Badge variant={
                        (selectedUserActivity.activity_metrics?.engagement_level === 'high') ? 'default' :
                        (selectedUserActivity.activity_metrics?.engagement_level === 'medium') ? 'secondary' : 'outline'
                      }>
                        {selectedUserActivity.activity_metrics?.engagement_level || 'low'} engagement
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart2 className="h-4 w-4" />
                      Productivity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {selectedUserActivity.activity_metrics?.tasks_completed || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Tasks Completed</p>
                      <div className="text-sm">
                        {selectedUserActivity.activity_metrics?.campaigns_managed || 0} campaigns managed
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Last Active</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedUserActivity.last_activity_at 
                              ? format(new Date(selectedUserActivity.last_activity_at), 'MMM dd, yyyy HH:mm')
                              : 'No recent activity'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedUserActivity.activity_metrics?.last_active_campaign && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Last Campaign</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedUserActivity.activity_metrics.last_active_campaign}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivityDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Management - {selectedUserRole?.full_name}
            </DialogTitle>
            <DialogDescription>
              Manage user roles and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUserRole && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Current Role</p>
                  <Badge variant={getRoleBadgeVariant(selectedUserRole.role)}>
                    {getRoleDisplayName(selectedUserRole.role)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedUserRole.metadata?.department || 'Not assigned'}</p>
                </div>
              </div>

              <div>
                <Label>Change Role</Label>
                <Select
                  value={selectedUserRole.role || 'executive'}
                  onValueChange={(value) => {
                    if (selectedUserRole) {
                      updateUserMutation.mutate({
                        ...selectedUserRole,
                        role: value as any,
                        full_name: selectedUserRole.full_name,
                        email: selectedUserRole.email,
                        phone: selectedUserRole.phone || '',
                        department: selectedUserRole.metadata?.department || '',
                        position: selectedUserRole.metadata?.position || '',
                        join_date: selectedUserRole.metadata?.join_date || new Date().toISOString().split('T')[0],
                        id: selectedUserRole.id
                      });
                      setShowRoleDialog(false);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin - Full system access
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Manager - Team management
                      </div>
                    </SelectItem>
                    <SelectItem value="executive">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Executive - Campaign execution
                      </div>
                    </SelectItem>

                    <SelectItem value="vendor">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Vendor - Field operations
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Role Permissions</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {selectedUserRole.role === 'admin' && (
                    <>
                      <p>• Full system administration</p>
                      <p>• User management</p>
                      <p>• All campaign operations</p>
                      <p>• Analytics and reporting</p>
                    </>
                  )}
                  {selectedUserRole.role === 'manager' && (
                    <>
                      <p>• Campaign creation and management</p>
                      <p>• Team oversight</p>
                      <p>• Client management</p>
                      <p>• Vendor coordination</p>
                    </>
                  )}
                  {selectedUserRole.role === 'executive' && (
                    <>
                      <p>• Campaign execution</p>
                      <p>• Task management</p>
                      <p>• Reporting</p>
                    </>
                  )}

                  {selectedUserRole.role === 'vendor' && (
                    <>
                      <p>• Field task execution</p>
                      <p>• Photo uploads</p>
                      <p>• Expense submission</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersList;