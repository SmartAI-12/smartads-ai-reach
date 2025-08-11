import React, { useState } from 'react';
import { Plus, Calendar, User, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/ui/loading';
import { useTasks, Task, useUpdateTask } from '@/hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { DataTable, Column } from '@/components/ui/data-table';
import { MobileCardList, MobileCardItem } from '@/components/ui/mobile-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { SwipeActions } from '@/components/ui/swipe-actions';
import { AdvancedFilters } from '@/components/ui/advanced-filters';
import { ColumnManager } from '@/components/ui/column-manager';

export const TasksList: React.FC = () => {
  const { data: tasks, isLoading, refetch } = useTasks();
  const updateTask = useUpdateTask();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['completed', 'title', 'priority', 'status', 'assignee', 'due_date']);
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingState>Loading tasks...</LoadingState>;
  }

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const handleTaskComplete = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date().getTime() - new Date(dueDate).getTime() > 24 * 60 * 60 * 1000;
  };

  const searchFilters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]
    }
  ];

  const activeFilters = { status: statusFilter, priority: priorityFilter };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') setStatusFilter(value);
    if (key === 'priority') setPriorityFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const exportData = () => {
    const csv = filteredTasks.map(task => ({
      Title: task.title,
      Description: task.description || '',
      Status: task.status,
      Priority: task.priority,
      Campaign: task.campaigns?.name || '',
      'Assigned To': task.profiles?.full_name || '',
      'Due Date': task.due_date ? new Date(task.due_date).toLocaleDateString() : '',
      Created: new Date(task.created_at).toLocaleDateString()
    }));
    
    const csvContent = [
      Object.keys(csv[0] || {}).join(','),
      ...csv.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isMobile = useIsMobile();

  // DataTable columns configuration
  const allColumns: Column<Task>[] = [
    {
      key: 'completed',
      title: '',
      width: '60px',
      render: (task) => (
        <Checkbox 
          checked={task.status === 'completed'}
          onCheckedChange={() => handleTaskComplete(task)}
        />
      )
    },
    {
      key: 'title',
      title: 'Task',
      sortable: true,
      render: (task) => (
        <div className="space-y-1">
          <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      sortable: true,
      width: '120px',
      render: (task) => (
        <Badge variant={getPriorityVariant(task.priority)}>
          {task.priority}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '120px',
      render: (task) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          <span className="capitalize">{task.status.replace('_', ' ')}</span>
        </div>
      )
    },
    {
      key: 'assignee',
      title: 'Assignee',
      width: '150px',
      render: (task) => task.profiles?.full_name ? (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>{task.profiles.full_name}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">Unassigned</span>
      )
    },
    {
      key: 'due_date',
      title: 'Due Date',
      sortable: true,
      width: '150px',
      render: (task) => task.due_date ? (
        <div className={`flex items-center gap-1 ${
          isOverdue(task.due_date) ? 'text-destructive' : ''
        }`}>
          {isOverdue(task.due_date) ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <Calendar className="h-3 w-3" />
          )}
          <span>
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground">No due date</span>
      )
    }
  ];

  const columns = allColumns.filter(col => visibleColumns.includes(col.key));

  // Mobile card items configuration
  const mobileItems: MobileCardItem[] = filteredTasks.map(task => ({
    id: task.id,
    title: task.title,
    subtitle: task.description || undefined,
    status: {
      label: task.status.replace('_', ' '),
      variant: task.status === 'completed' ? 'secondary' : 'default'
    },
    metadata: [
      ...(task.profiles?.full_name ? [{ label: 'Assignee', value: task.profiles.full_name, icon: User }] : []),
      ...(task.due_date ? [{ 
        label: isOverdue(task.due_date) ? 'Overdue' : 'Due Date', 
        value: new Date(task.due_date).toLocaleDateString(),
        icon: isOverdue(task.due_date) ? AlertTriangle : Calendar,
        variant: isOverdue(task.due_date) ? 'destructive' as const : undefined
      }] : []),
      { label: 'Priority', value: task.priority, variant: getPriorityVariant(task.priority) as 'default' | 'secondary' | 'destructive' | 'outline' }
    ],
    actions: [
      {
        label: task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete',
        onClick: () => handleTaskComplete(task),
        variant: task.status === 'completed' ? 'outline' : 'default'
      }
    ]
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Tasks
          </h1>
          <p className="text-muted-foreground">
            Track and manage your campaign tasks
          </p>
        </div>
        <Button onClick={() => navigate('/tasks/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
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
        placeholder="Search tasks by title or description..."
      />

      {/* Tasks Data Display */}
      <PullToRefresh onRefresh={handleRefresh}>
        {isMobile ? (
          <MobileCardList
            items={mobileItems}
            loading={isLoading}
            onItemClick={(id) => navigate(`/tasks/${id}`)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <ColumnManager
                columns={allColumns.map(col => ({
                  key: col.key,
                  title: col.title,
                  visible: visibleColumns.includes(col.key),
                  required: col.key === 'title'
                }))}
                onColumnToggle={(key, visible) => {
                  if (visible) {
                    setVisibleColumns(prev => [...prev, key]);
                  } else {
                    setVisibleColumns(prev => prev.filter(col => col !== key));
                  }
                }}
                onReset={() => setVisibleColumns(['completed', 'title', 'priority', 'status', 'assignee', 'due_date'])}
              />
            </div>
            <DataTable
              data={filteredTasks}
              columns={columns}
              title="Tasks"
              loading={isLoading}
              emptyMessage="No tasks found matching your criteria"
              emptyAction={{
                label: "Create Your First Task",
                onClick: () => navigate('/tasks/create'),
                icon: Plus
              }}
            />
          </div>
        )}
      </PullToRefresh>
    </div>
  );
};