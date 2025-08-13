import React from 'react';
import LeadsList from '@/components/leads/LeadsList';
import { ExecutiveLeadView } from '@/components/leads/ExecutiveLeadView';
import { useAuth } from '@/contexts/AuthContext';

export default function LeadsPage() {
  const { profile } = useAuth();

  // Show executive-specific lead view for executives
  if (profile?.role === 'executive') {
    return <ExecutiveLeadView />;
  }

  return (
    <div className="p-6">
      <LeadsList />
    </div>
  );
}