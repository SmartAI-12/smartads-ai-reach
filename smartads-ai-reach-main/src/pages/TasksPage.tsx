import React from 'react';
import { TasksList } from '@/components/tasks/TasksList';

const TasksPage: React.FC = () => {
  return (
    <div className="p-6">
      <TasksList />
    </div>
  );
};

export default TasksPage;