import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateExecutionReport } from '@/hooks/useExecutionReports';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ExecutionReportForm, { ExecutionReportFormData } from '@/components/forms/ExecutionReportForm';

const CreateExecutionReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createReportMutation = useCreateExecutionReport();
  const { toast } = useToast();

  const onSubmit = (data: ExecutionReportFormData & { activities: string[] }) => {
    if (!profile?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a report.",
        variant: "destructive",
      });
      return;
    }
    
    const reportData = {
      ...data,
      created_by: profile.id,
    };

    createReportMutation.mutate(reportData, {
      onSuccess: () => {
        navigate('/execution-reports');
      },
      onError: (error: any) => {
        // Error handling is now done in the form component
        console.error('Report creation error:', error);
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/execution-reports')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Execution Report</h1>
          <p className="text-muted-foreground">
            Document campaign execution progress and activities
          </p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
          <CardDescription>
            Enter the execution report information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExecutionReportForm 
            onSubmit={onSubmit}
            onCancel={() => navigate('/execution-reports')}
            isSubmitting={createReportMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateExecutionReportPage;