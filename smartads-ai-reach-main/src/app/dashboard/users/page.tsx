import { UsersList } from '@/components/users/UsersList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management | SmartAds Reach',
  description: 'Manage users and their permissions',
};

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users and their permissions in one place
          </p>
        </div>
        
        <UsersList />
      </div>
    </div>
  );
}
