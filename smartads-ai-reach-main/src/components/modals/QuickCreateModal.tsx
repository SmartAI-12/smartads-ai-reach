import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';

interface QuickCreateModalProps {
  type: 'campaign' | 'task' | 'client';
  trigger?: React.ReactNode;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({ type, trigger }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { profile } = useAuth();
  const createCampaign = useCreateCampaign();
  const { data: clients } = useClients();

  const handleSubmit = async () => {
    try {
      if (type === 'campaign') {
        await createCampaign.mutateAsync({
          ...formData,
          created_by: profile?.id,
        });
      }
      setOpen(false);
      setFormData({});
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  const renderCampaignForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Campaign Name</Label>
        <Input
          id="name"
          placeholder="Enter campaign name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="client">Client</Label>
        <Select value={formData.client_id || ''} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Campaign description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            placeholder="0"
            value={formData.budget || ''}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status || 'draft'} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (type) {
      case 'campaign':
        return 'Create New Campaign';
      case 'task':
        return 'Create New Task';
      case 'client':
        return 'Create New Client';
      default:
        return 'Create New';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'campaign':
        return 'Create a new marketing campaign to track and manage.';
      case 'task':
        return 'Create a new task to assign and track progress.';
      case 'client':
        return 'Add a new client to your portfolio.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create {type}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        
        {type === 'campaign' && renderCampaignForm()}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createCampaign.isPending}
          >
            {createCampaign.isPending ? 'Creating...' : `Create ${type}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};