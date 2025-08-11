import React from 'react';
import { CampaignsList } from '@/components/campaigns/CampaignsList';

const CampaignsPage: React.FC = () => {
  return (
    <div className="p-6">
      <CampaignsList />
    </div>
  );
};

export default CampaignsPage;