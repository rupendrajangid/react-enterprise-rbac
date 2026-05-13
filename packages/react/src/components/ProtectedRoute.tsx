import React from 'react';
import { useRBAC } from '../context/RBACContext';

interface ProtectedRouteProps<P extends string = string> {
  permission?: P;
  role?: string | string[];
  children: React.ReactNode;
  fallbackPath?: string; 
  unauthorizedComponent?: React.ReactNode;
}

export const ProtectedRoute = <P extends string = string>({ 
  permission, 
  role, 
  children, 
  unauthorizedComponent = <div>Unauthorized</div> 
}: ProtectedRouteProps<P>) => {
  const { user, can, isLoading } = useRBAC<P>();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <>{unauthorizedComponent}</>;

  if (permission && !can(permission)) {
    return <>{unauthorizedComponent}</>;
  }

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    const hasRole = user.roles.some(r => roles.includes(r));
    if (!hasRole) return <>{unauthorizedComponent}</>;
  }

  return <>{children}</>;
};
