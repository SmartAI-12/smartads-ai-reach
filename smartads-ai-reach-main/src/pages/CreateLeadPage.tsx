import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateLead } from '@/hooks/useLeads';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LeadForm, { LeadFormData } from '@/components/forms/LeadForm';

const CreateLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createLeadMutation = useCreateLead();
  const { toast } = useToast();

  const onSubmit = (data: LeadFormData) => {
    if (!profile?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a lead.",
        variant: "destructive",
      });
      return;
    }
    
    const leadData = {
      ...data,
      status: 'new' as const,
      created_by: profile.id,
      score: data.score || 0,
    };
    
    createLeadMutation.mutate(leadData, {
      onSuccess: () => {
        navigate('/leads');
      },
      onError: (error: any) => {
        // Error handling is now done in the form component
        console.error('Lead creation error:', error);
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/leads')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Lead</h1>
          <p className="text-muted-foreground">
            Add a new lead to track and manage
          </p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
          <CardDescription>
            Enter the details for the new lead
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadForm 
            onSubmit={onSubmit}
            onCancel={() => navigate('/leads')}
            isSubmitting={createLeadMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLeadPage;