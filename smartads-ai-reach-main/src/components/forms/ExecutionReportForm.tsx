import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Skeleton } from '@/components/ui/skeleton';
import { useEnhancedToast } from '@/components/ui/enhanced-toast';
import { FormSkeleton } from '@/components/ui/form-skeleton';

const reportSchema = z.object({
  campaign_id: z.string().min(1, 'Campaign is required'),
  report_date: z.string().min(1, 'Report date is required'),
  activities: z.array(z.string()).optional(),
  challenges: z.string().optional(),
  next_steps: z.string().optional(),
  metrics: z.record(z.string(), z.any()).optional(),
});

export type ExecutionReportFormData = z.infer<typeof reportSchema>;

interface ExecutionReportFormProps {
  onSubmit: (data: ExecutionReportFormData & { activities: string[] }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<ExecutionReportFormData>;
}

const ExecutionReportForm: React.FC<ExecutionReportFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
}) => {
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const [activitiesInput, setActivitiesInput] = useState('');
  const { showToast } = useEnhancedToast();

  const form = useForm<ExecutionReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      campaign_id: '',
      report_date: new Date().toISOString().split('T')[0],
      activities: [],
      challenges: '',
      next_steps: '',
      metrics: {},
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: ExecutionReportFormData) => {
    try {
      // Process activities input - split by lines and filter empty ones
      const activities = activitiesInput
        .split('\n')
        .map(activity => activity.trim())
        .filter(activity => activity.length > 0);

      await onSubmit({
        ...data,
        activities,
      });

      showToast({
        title: 'Report created successfully',
        description: 'Execution report has been submitted.',
        type: 'success'
      });
    } catch (error: any) {
      showToast({
        title: 'Failed to create report',
        description: error?.message || 'There was an error creating the report. Please try again.',
        type: 'error'
      });
    }
  };

  if (campaignsLoading) {
    return <FormSkeleton fields={5} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="campaign_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="report_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Completed Activities
            </label>
            <Textarea
              placeholder="Enter each activity on a new line&#10;• Activity 1&#10;• Activity 2&#10;• Activity 3"
              className="min-h-[120px] mt-2"
              value={activitiesInput}
              onChange={(e) => setActivitiesInput(e.target.value)}
            />
          </div>

          <FormField
            control={form.control}
            name="challenges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Challenges Faced</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe any challenges or obstacles encountered..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="next_steps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Steps</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Outline the planned next steps and actions..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Report'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExecutionReportForm;