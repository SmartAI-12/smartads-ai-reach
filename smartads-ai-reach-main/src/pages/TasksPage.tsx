import React from 'react';
import { TasksList } from '@/components/tasks/TasksList';
import { ExecutiveTaskView } from '@/components/tasks/ExecutiveTaskView';
import { useAuth } from '@/contexts/AuthContext';

const TasksPage: React.FC = () => {
  const { profile } = useAuth();

  // Show executive-specific task view for executives
  if (profile?.role === 'executive') {
    return <ExecutiveTaskView />;
  }

  return (
    <div className="p-6">
      <TasksList />
    </div>
  );
};

export default TasksPage;