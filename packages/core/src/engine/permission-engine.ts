import { User, AccessRequest, ScopeType, defaultHierarchy } from '../types';

export class PermissionEngine<P extends string = string> {
  private hierarchy = defaultHierarchy;

  constructor(config?: { hierarchy?: Record<ScopeType, number> }) {
    if (config?.hierarchy) {
      this.hierarchy = config.hierarchy;
    }
  }

  /**
   * Check if user has a specific permission globally.
   * Supports wildcards (e.g., 'task.*' matches 'task.create')
   */
  public can(user: User<P>, permission: P): boolean {
    const userPermissions = this.getAllUserPermissions(user);
    return this.matchPermission(userPermissions, permission);
  }

  /**
   * Check if user has access to a specific scope/resource.
   */
  public canAccess(user: User<P>, request: AccessRequest<P>): boolean {
    const { permission, scope, scopeId } = request;

    // 1. Check global permissions first
    if (permission && this.can(user, permission)) {
      return true;
    }

    // 2. Check scope-specific permissions
    if (scope && scopeId) {
      const userScope = user.scopes.find((s) => s.type === scope && s.id === scopeId);
      if (userScope) {
        if (!permission) return true;
        if (userScope.permissions && this.matchPermission(userScope.permissions, permission)) {
          return true;
        }
      }

      // 3. Check hierarchical inheritance
      const parentScopes = user.scopes.filter(
        (s) => this.hierarchy[s.type] < this.hierarchy[scope]
      );
      
      for (const parent of parentScopes) {
        if (permission && parent.permissions && this.matchPermission(parent.permissions as P[], permission)) {
          return true;
        }
        
        if (!permission) return true;
      }
    }

    return false;
  }

  private getAllUserPermissions(user: User<P>): P[] {
    return user.permissions;
  }

  private matchPermission(userPermissions: P[], target: P): boolean {
    return userPermissions.some((p) => {
      if ((p as string) === (target as string) || p === '*') return true;
      if ((p as string).endsWith('.*')) {
        const prefix = (p as string).slice(0, -2);
        return (target as string).startsWith(prefix);
      }
      return false;
    });
  }
}

export const createPermissionEngine = <P extends string = string>(config?: { hierarchy?: Record<ScopeType, number> }) => {
  return new PermissionEngine<P>(config);
};
