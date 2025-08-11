import React from 'react';
import { EnhancedAnalytics } from '@/components/analytics/EnhancedAnalytics';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into your campaigns, leads, and performance metrics
        </p>
      </div>
      
      <EnhancedAnalytics />
    </div>
  );
};