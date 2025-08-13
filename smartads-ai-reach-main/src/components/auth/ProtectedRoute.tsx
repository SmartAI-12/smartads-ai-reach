import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from './AuthForm';
import { Skeleton } from '@/components/ui/skeleton';
import { hasAccess, UserRole } from '@/utils/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowedRoles
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const userRole = profile?.role as UserRole;
  
  // Check access based on role hierarchy or allowed roles
  if (requiredRole && userRole && !hasAccess(userRole, requiredRole, allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Required role: {requiredRole} | Your role: {userRole || 'unknown'}
          </p>
          {allowedRoles && (
            <p className="text-xs text-muted-foreground">
              Allowed roles: {allowedRoles.join(', ')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};