import React from 'react';
import { useRBAC } from '../context/RBACContext';
import { ScopeType } from '@react-enterprise-rbac/core';

interface GuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface CanProps<P extends string = string> extends GuardProps {
  permission: P;
}

export const Can = <P extends string = string>({ 
  permission, 
  children, 
  fallback = null 
}: CanProps<P>) => {
  const { can } = useRBAC<P>();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
};

export const Cannot = <P extends string = string>({ 
  permission, 
  children, 
  fallback = null 
}: CanProps<P>) => {
  const { can } = useRBAC<P>();
  return !can(permission) ? <>{children}</> : <>{fallback}</>;
};

interface ScopeGuardProps<P extends string = string> extends GuardProps {
  scope: ScopeType;
  scopeId: string;
  permission?: P;
}

export const ScopeGuard = <P extends string = string>({ 
  scope, 
  scopeId, 
  permission, 
  children, 
  fallback = null 
}: ScopeGuardProps<P>) => {
  const { canAccess } = useRBAC<P>();
  return canAccess({ scope, scopeId, permission }) ? <>{children}</> : <>{fallback}</>;
};

interface RoleGuardProps extends GuardProps {
  role: string | string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ role, children, fallback = null }) => {
  const { user } = useRBAC();
  if (!user) return <>{fallback}</>;
  
  const roles = Array.isArray(role) ? role : [role];
  const hasRole = user.roles.some(r => roles.includes(r));
  
  return hasRole ? <>{children}</> : <>{fallback}</>;
};
