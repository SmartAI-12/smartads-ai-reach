import React from 'react';
import ExecutionReportsList from '@/components/reports/ExecutionReportsList';
import { ExecutiveReportView } from '@/components/reports/ExecutiveReportView';
import { useAuth } from '@/contexts/AuthContext';

export default function ExecutionReportsPage() {
  const { profile } = useAuth();

  // Show executive-specific report view for executives
  if (profile?.role === 'executive') {
    return <ExecutiveReportView />;
  }

  return (
    <div className="p-6">
      <ExecutionReportsList />
    </div>
  );
}