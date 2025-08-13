import React from 'react';
import ExpensesList from '@/components/expenses/ExpensesList';
import { ExecutiveExpenseView } from '@/components/expenses/ExecutiveExpenseView';
import { useAuth } from '@/contexts/AuthContext';

export default function ExpensesPage() {
  const { profile } = useAuth();

  // Show executive-specific expense view for executives
  if (profile?.role === 'executive') {
    return <ExecutiveExpenseView />;
  }

  return (
    <div className="p-6">
      <ExpensesList />
    </div>
  );
}