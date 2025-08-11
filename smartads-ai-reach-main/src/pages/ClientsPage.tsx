import React from 'react';
import { ClientsList } from '@/components/clients/ClientsList';

const ClientsPage: React.FC = () => {
  return (
    <div className="p-6">
      <ClientsList />
    </div>
  );
};

export default ClientsPage;