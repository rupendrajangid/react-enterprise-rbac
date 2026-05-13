import React, { createContext, useContext, useMemo } from 'react';
import { User, createPermissionEngine, PermissionEngine, AccessRequest } from '@react-enterprise-rbac/core';

interface RBACContextValue<P extends string = string> {
  user: User<P> | null;
  engine: PermissionEngine<P>;
  can: (permission: P) => boolean;
  canAccess: (request: AccessRequest<P>) => boolean;
  isLoading?: boolean;
}

const RBACContext = createContext<RBACContextValue<any> | undefined>(undefined);

export interface RBACProviderProps<P extends string = string> {
  user: User<P> | null;
  children: React.ReactNode;
  config?: any;
  isLoading?: boolean;
}

export const RBACProvider = <P extends string = string>({ 
  user, 
  children, 
  config, 
  isLoading 
}: RBACProviderProps<P>) => {
  const engine = useMemo(() => createPermissionEngine<P>(config), [config]);

  const value = useMemo(() => ({
    user,
    engine,
    can: (permission: P) => user ? engine.can(user, permission) : false,
    canAccess: (request: AccessRequest<P>) => user ? engine.canAccess(user, request) : false,
    isLoading
  }), [user, engine, isLoading]);

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

export const useRBAC = <P extends string = string>() => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context as RBACContextValue<P>;
};
