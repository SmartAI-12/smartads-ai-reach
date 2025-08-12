import React, { useState } from 'react';
import { Plus, Calendar, User, CheckCircle2, Clock, AlertTriangle, MapPin, Camera, DollarSign, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/ui/loading';
import { useVendorTasks, useUpdateVendorTask } from '@/hooks/useVendorTasks';
import { useCreateCheckIn, useUploadTaskPhoto, useCreateExpense } from '@/hooks/useVendorCheckins';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { DataTable, Column } from '@/components/ui/data-table';
import { MobileCardList, MobileCardItem } from '@/components/ui/mobile-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { SwipeActions } from '@/components/ui/swipe-actions';
import { AdvancedFilters } from '@/components/ui/advanced-filters';
import { ColumnManager } from '@/components/ui/column-manager';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const VendorTasksList: React.FC = () => {
  const { data: tasks, isLoading, refetch } = useVendorTasks();
  const updateTask = useUpdateVendorTask();
  const createCheckIn = useCreateCheckIn();
  const uploadPhoto = useUploadTaskPhoto();
  const createExpense = useCreateExpense();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['completed', 'title', 'priority', 'status', 'due_date', 'actions']);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isLoading) {
    return <LoadingState>Loading your tasks...</LoadingState>;
  }

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const handleTaskComplete = (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const handleCheckIn = async () => {
    if (!selectedTask) return;

    try {
      const location = await getCurrentLocation();
      await createCheckIn.mutateAsync({
        task_id: selectedTask.id,
        location: `POINT(${location.lng} ${location.lat})`,
        address,
        notes
      });

      setCurrentLocation(location);
      setAddress('');
      setNotes('');
      setIsCheckInDialogOpen(false);
      toast({
        title: "Success",
        description: "Check-in recorded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedTask || !photoFile) return;

    try {
      // Upload file to Supabase storage
      const fileName = `${selectedTask.id}/${Date.now()}-${photoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-photos')
        .upload(fileName, photoFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-photos')
        .getPublicUrl(fileName);

      // Get current location for photo
      const location = await getCurrentLocation();
      
      await uploadPhoto.mutateAsync({
        task_id: selectedTask.id,
        photo_url: publicUrl,
        location: `POINT(${location.lng} ${location.lat})`,
        caption: photoCaption
      });

      setPhotoFile(null);
      setPhotoCaption('');
      setIsPhotoDialogOpen(false);
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExpenseLog = async () => {
    if (!selectedTask || !expenseAmount || !expenseCategory) return;

    try {
      await createExpense.mutateAsync({
        task_id: selectedTask.id,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDescription,
        status: 'pending'
      });

      setExpenseAmount('');
      setExpenseCategory('');
      setExpenseDescription('');
      setIsExpenseDialogOpen(false);
      toast({
        title: "Success",
        description: "Expense logged successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const searchFilters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'all', label: 'All Priorities' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]
    }
  ];

  const columns: Column<any>[] = [
    {
      key: 'completed',
      title: '',
      render: (_, row) => (
        <Checkbox
          checked={row.status === 'completed'}
          onCheckedChange={() => handleTaskComplete(row)}
        />
      ),
    },
    {
      key: 'title',
      title: 'Task',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-sm text-gray-500">{row.campaigns?.name}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (_, row) => (
        <Badge variant={getPriorityVariant(row.priority)}>
          {row.priority}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.status)}
          <span className="text-sm">{row.status}</span>
        </div>
      ),
    },
    {
      key: 'due_date',
      title: 'Due Date',
      render: (_, row) => (
        <div className="text-sm">
          {row.due_date ? (
            <div className={isOverdue(row.due_date) ? 'text-red-600 font-medium' : ''}>
              {new Date(row.due_date).toLocaleDateString()}
              {isOverdue(row.due_date) && <AlertTriangle className="w-4 h-4 inline ml-1" />}
            </div>
          ) : (
            'No due date'
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedTask(row);
              setIsCheckInDialogOpen(true);
            }}
          >
            <Check className="w-4 h-4 mr-1" />
            Check In
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedTask(row);
              setIsPhotoDialogOpen(true);
            }}
          >
            <Camera className="w-4 h-4 mr-1" />
            Photo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedTask(row);
              setIsExpenseDialogOpen(true);
            }}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Expense
          </Button>
        </div>
      ),
    },
  ];

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-gray-600">Tasks assigned to you</p>
          </div>
        </div>

        <GlobalSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search tasks..."
          filters={searchFilters}
          activeFilters={{ status: statusFilter, priority: priorityFilter }}
          onFilterChange={(key, value) => {
            if (key === 'status') setStatusFilter(value);
            if (key === 'priority') setPriorityFilter(value);
          }}
          onClearFilters={() => {
            setStatusFilter('all');
            setPriorityFilter('all');
            setSearchTerm('');
          }}
        />

        <PullToRefresh onRefresh={handleRefresh}>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.campaigns?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                    <Badge variant={getPriorityVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{task.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Check-ins: {task.check_ins?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Photos: {task.task_photos?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Expenses: {task.expenses?.length || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsCheckInDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Check In
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsPhotoDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Photo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsExpenseDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Expense
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </PullToRefresh>

        {/* Check-in Dialog */}
        <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check In</DialogTitle>
              <DialogDescription>
                Record your location and notes for this task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address or location description"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this check-in"
                />
              </div>
              <Button onClick={handleCheckIn} disabled={createCheckIn.isPending}>
                {createCheckIn.isPending ? 'Recording...' : 'Record Check-in'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Photo Upload Dialog */}
        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Proof Photo</DialogTitle>
              <DialogDescription>
                Take or upload a photo as proof of work
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="photo">Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label htmlFor="caption">Caption (optional)</Label>
                <Input
                  id="caption"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Add a caption to the photo"
                />
              </div>
              <Button onClick={handlePhotoUpload} disabled={uploadPhoto.isPending || !photoFile}>
                {uploadPhoto.isPending ? 'Uploading...' : 'Upload Photo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Expense Log Dialog */}
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Expense</DialogTitle>
              <DialogDescription>
                Record an expense related to this task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Describe the expense"
                />
              </div>
              <Button onClick={handleExpenseLog} disabled={createExpense.isPending || !expenseAmount || !expenseCategory}>
                {createExpense.isPending ? 'Logging...' : 'Log Expense'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-gray-600">Tasks assigned to you</p>
        </div>
      </div>

      <GlobalSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search tasks..."
        filters={searchFilters}
        activeFilters={{ status: statusFilter, priority: priorityFilter }}
        onFilterChange={(key, value) => {
          if (key === 'status') setStatusFilter(value);
          if (key === 'priority') setPriorityFilter(value);
        }}
        onClearFilters={() => {
          setStatusFilter('all');
          setPriorityFilter('all');
          setSearchTerm('');
        }}
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <DataTable
          data={filteredTasks}
          columns={columns}
        />
      </PullToRefresh>

      {/* Check-in Dialog */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
            <DialogDescription>
              Record your location and notes for this task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Address (optional)</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address or location description"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this check-in"
              />
            </div>
            <Button onClick={handleCheckIn} disabled={createCheckIn.isPending}>
              {createCheckIn.isPending ? 'Recording...' : 'Record Check-in'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Proof Photo</DialogTitle>
            <DialogDescription>
              Take or upload a photo as proof of work
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo">Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Add a caption to the photo"
              />
            </div>
            <Button onClick={handlePhotoUpload} disabled={uploadPhoto.isPending || !photoFile}>
              {uploadPhoto.isPending ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Log Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Expense</DialogTitle>
            <DialogDescription>
              Record an expense related to this task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="meals">Meals</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Describe the expense"
              />
            </div>
            <Button onClick={handleExpenseLog} disabled={createExpense.isPending || !expenseAmount || !expenseCategory}>
              {createExpense.isPending ? 'Logging...' : 'Log Expense'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
