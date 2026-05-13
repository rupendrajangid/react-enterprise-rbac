import { useRBAC } from '../context/RBACContext';
import { AccessRequest } from '@react-enterprise-rbac/core';

export const usePermission = <P extends string = string>() => {
  const { can, canAccess } = useRBAC<P>();
  return { can, canAccess };
};

export const useCurrentUser = <P extends string = string>() => {
  const { user, isLoading } = useRBAC<P>();
  return { user, isLoading };
};

export const useScopeAccess = <P extends string = string>(request: AccessRequest<P>) => {
  const { canAccess } = useRBAC<P>();
  return canAccess(request);
};
