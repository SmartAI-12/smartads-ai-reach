import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  User, 
  Target,
  Plus,
  Filter,
  CheckCircle2,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks, useUpdateTask, Task } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

export const ExecutiveTaskView: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const { data: allTasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();

  // Filter tasks for executive user
  const myTasks = allTasks?.filter(task => 
    task.assigned_to === profile?.id || task.created_by === profile?.id
  ) || [];

  const activeTasks = myTasks.filter(task => task.status !== 'completed');
  const completedTasks = myTasks.filter(task => task.status === 'completed');
  const overdueTasks = myTasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  );

  // Apply priority filter
  const filteredActiveTasks = priorityFilter === 'all' 
    ? activeTasks 
    : activeTasks.filter(task => task.priority === priorityFilter);

  const handleTaskStatusUpdate = async (task: Task, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      await updateTask.mutateAsync({ 
        id: task.id, 
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Task Updated",
        description: `Task "${task.title}" marked as ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'pending': return <PauseCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const TaskCard: React.FC<{ task: Task; showActions?: boolean }> = ({ task, showActions = true }) => (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue(task.due_date) ? 'border-red-200 bg-red-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium mb-1 flex items-center gap-2">
              {getStatusIcon(task.status)}
              {task.title}
              {isOverdue(task.due_date) && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </h4>
            {task.description && (
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            )}
          </div>
          <Badge className={getTaskPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {task.campaigns && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{task.campaigns.name}</span>
            </div>
          )}
          {task.due_date && (
            <div className={`flex items-center gap-1 ${isOverdue(task.due_date) ? 'text-red-600' : ''}`}>
              <Calendar className="h-3 w-3" />
              <span>
                {isOverdue(task.due_date) ? 'Overdue: ' : 'Due: '}
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {task.profiles && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.profiles.full_name}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              View Details
            </Button>
            {task.status !== 'completed' && (
              <Button
                size="sm"
                onClick={() => handleTaskStatusUpdate(task, 'completed')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}
            {task.status === 'pending' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleTaskStatusUpdate(task, 'in_progress')}
              >
                <PlayCircle className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const taskCompletionRate = myTasks.length > 0 
    ? Math.round((completedTasks.length / myTasks.length) * 100) 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="text-muted-foreground">
            Manage your assigned tasks and track progress
          </p>
        </div>
        <Button onClick={() => navigate('/tasks/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Task Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeTasks.length}</div>
            <div className="text-sm text-muted-foreground">Active Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{taskCompletionRate}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <EnhancedCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{taskCompletionRate}%</span>
        </div>
        <Progress value={taskCompletionRate} className="h-2" />
      </EnhancedCard>

      {/* Task Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active Tasks ({activeTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueTasks.length})</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          {filteredActiveTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActiveTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground mb-4">
                {priorityFilter !== 'all' 
                  ? `No ${priorityFilter} priority tasks remaining` 
                  : 'No active tasks remaining'}
              </p>
              <Button onClick={() => navigate('/tasks/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedTasks.slice(0, 12).map((task) => (
                <TaskCard key={task.id} task={task} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No completed tasks yet</h3>
              <p className="text-muted-foreground">
                Completed tasks will appear here
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {overdueTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">No overdue tasks!</h3>
              <p className="text-muted-foreground">
                Great job staying on top of your deadlines
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
