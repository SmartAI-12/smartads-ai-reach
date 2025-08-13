// Role hierarchy - higher numbers have more access
export const ROLE_HIERARCHY = {
  vendor: 1,
  client: 2,
  executive: 3,
  manager: 4,
  admin: 5
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

/**
 * Check if a user role has access based on hierarchy or specific allowed roles
 * @param userRole - The user's current role
 * @param requiredRole - The minimum required role (uses hierarchy)
 * @param allowedRoles - Specific roles that are allowed (overrides hierarchy)
 * @returns boolean indicating if access is granted
 */
export const hasAccess = (
  userRole: UserRole, 
  requiredRole?: UserRole, 
  allowedRoles?: UserRole[]
): boolean => {
  if (!userRole) return false;
  
  // If specific roles are allowed, check if user role is in the list
  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles.includes(userRole);
  }
  
  // If no required role specified, allow access
  if (!requiredRole) return true;
  
  // Use hierarchy - user can access if their role level >= required role level
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Check if user can perform admin-level actions
 */
export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === 'admin';
};

/**
 * Check if user can perform manager-level actions
 */
export const isManagerOrAbove = (userRole: UserRole): boolean => {
  return hasAccess(userRole, 'manager');
};

/**
 * Check if user can perform executive-level actions
 */
export const isExecutiveOrAbove = (userRole: UserRole): boolean => {
  return hasAccess(userRole, 'executive');
};

/**
 * Get user-friendly role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    admin: 'Administrator',
    manager: 'Manager',
    executive: 'Executive',
    client: 'Client',
    vendor: 'Vendor'
  };
  
  return roleNames[role] || role;
};

/**
 * Get roles that can access a specific feature
 */
export const getRolesForFeature = (feature: string): UserRole[] => {
  const featureRoles: Record<string, UserRole[]> = {
    // Admin-only features
    'user-management': ['admin', 'manager'],
    'system-settings': ['admin'],
    
    // Manager+ features
    'campaign-creation': ['admin', 'manager', 'executive'],
    'client-management': ['admin', 'manager', 'executive'],
    'vendor-management': ['admin', 'manager', 'executive'],
    
    // Executive+ features
    'analytics': ['admin', 'manager', 'executive', 'client'],
    'reports': ['admin', 'manager', 'executive', 'client'],
    
    // Client features
    'view-campaigns': ['admin', 'manager', 'executive', 'client'],
    'view-reports': ['admin', 'manager', 'executive', 'client'],
    
    // Vendor features
    'vendor-tasks': ['vendor'],
    'vendor-campaigns': ['vendor'],
    'task-checkins': ['vendor'],
    
    // Universal features
    'profile': ['admin', 'manager', 'executive', 'client', 'vendor'],
    'dashboard': ['admin', 'manager', 'executive', 'client', 'vendor']
  };
  
  return featureRoles[feature] || [];
};
