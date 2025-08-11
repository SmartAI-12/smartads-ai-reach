import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle, 
  ClipboardList, 
  FileText,
  User
} from 'lucide-react';
import { useActivities, useActivitySubscription } from '@/hooks/useActivities';
import { Skeleton } from '@/components/ui/skeleton';

const getActivityIcon = (entityType: string, action: string) => {
  if (entityType === 'campaign') return <Calendar className="w-4 h-4" />;
  if (entityType === 'lead') return <Users className="w-4 h-4" />;
  if (entityType === 'expense') return <DollarSign className="w-4 h-4" />;
  if (entityType === 'task') return <CheckCircle className="w-4 h-4" />;
  if (entityType === 'execution_report') return <FileText className="w-4 h-4" />;
  return <ClipboardList className="w-4 h-4" />;
};

const getActivityColor = (action: string) => {
  if (action.includes('created')) return 'bg-green-500';
  if (action.includes('updated')) return 'bg-blue-500';
  if (action.includes('deleted')) return 'bg-red-500';
  if (action.includes('completed')) return 'bg-purple-500';
  return 'bg-gray-500';
};

const getActionText = (action: string, entityType: string, entityName: string | null) => {
  const name = entityName || `${entityType}`;
  
  switch (action) {
    case 'created':
      return `created ${entityType} "${name}"`;
    case 'updated':
      return `updated ${entityType} "${name}"`;
    case 'deleted':
      return `deleted ${entityType} "${name}"`;
    case 'completed':
      return `completed ${entityType} "${name}"`;
    case 'assigned':
      return `was assigned to ${entityType} "${name}"`;
    case 'status_changed':
      return `changed status of ${entityType} "${name}"`;
    default:
      return `performed ${action} on ${entityType} "${name}"`;
  }
};

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  limit = 10, 
  showHeader = true 
}) => {
  const { data: activities, isLoading } = useActivities(limit);
  
  // Enable real-time updates
  useActivitySubscription();

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            No recent activity found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div 
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getActivityColor(activity.action)}`}
              >
                <div className="w-full h-full rounded-full flex items-center justify-center text-white">
                  {getActivityIcon(activity.entity_type, activity.action)}
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {activity.profiles?.full_name || 'Unknown User'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {activity.entity_type}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {getActionText(activity.action, activity.entity_type, activity.entity_name)}
              </p>
              
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};