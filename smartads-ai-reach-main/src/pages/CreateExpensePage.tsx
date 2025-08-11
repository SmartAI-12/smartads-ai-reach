import React from 'react';
import { ExpenseForm } from '@/components/forms/ExpenseForm';

const CreateExpensePage: React.FC = () => {
  return (
    <div className="p-6">
      <ExpenseForm />
    </div>
  );
};

export default CreateExpensePage;