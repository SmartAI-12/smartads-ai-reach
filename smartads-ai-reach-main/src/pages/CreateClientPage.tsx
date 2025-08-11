import React from 'react';
import { ClientForm } from '@/components/forms/ClientForm';

const CreateClientPage: React.FC = () => {
  return (
    <div className="p-6">
      <ClientForm />
    </div>
  );
};

export default CreateClientPage;