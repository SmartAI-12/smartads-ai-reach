import React from 'react';
import { VendorsList } from '@/components/vendors/VendorsList';

const VendorsPage: React.FC = () => {
  return (
    <div className="p-6">
      <VendorsList />
    </div>
  );
};

export default VendorsPage;