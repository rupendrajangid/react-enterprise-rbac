import { User, Role, UserScope, Condition } from '../types';

export class RoleEngine<P extends string = string> {
  private roles: Map<string, Role<P>> = new Map();

  constructor(roles: Role<P>[]) {
    roles.forEach(role => this.roles.set(role.name, role));
  }

  /**
   * Flatten a user's roles into permissions and conditions.
   * Handles role inheritance.
   */
  public flattenUser(user: User<P>): User<P> {
    const allPermissions = new Set<P>(user.permissions);
    const allConditions: Record<string, Condition[]> = { ...user.conditions };

    const processRole = (roleName: string, visited: Set<string> = new Set()) => {
      if (visited.has(roleName)) return;
      visited.add(roleName);

      const role = this.roles.get(roleName);
      if (!role) return;

      role.permissions.forEach(p => allPermissions.add(p));
      
      if (role.inherits) {
        role.inherits.forEach(parentRole => processRole(parentRole, visited));
      }
    };

    user.roles.forEach(roleName => processRole(roleName));

    return {
      ...user,
      permissions: Array.from(allPermissions),
      conditions: allConditions,
    };
  }

  /**
   * Enrich scopes with role-based permissions if applicable.
   */
  public enrichScopes(user: User<P>, scopeRoles: Record<string, string[]>): User<P> {
    const updatedScopes = user.scopes.map(scope => {
      const rolesForScope = scopeRoles[`${scope.type}:${scope.id}`] || [];
      const scopePermissions = new Set<P>(scope.permissions || []);
      
      const processRole = (roleName: string, visited: Set<string> = new Set()) => {
        if (visited.has(roleName)) return;
        visited.add(roleName);
        const role = this.roles.get(roleName);
        if (!role) return;
        role.permissions.forEach(p => scopePermissions.add(p));
        if (role.inherits) {
          role.inherits.forEach(parentRole => processRole(parentRole, visited));
        }
      };

      rolesForScope.forEach(roleName => processRole(roleName));

      return {
        ...scope,
        permissions: Array.from(scopePermissions),
      };
    });

    return {
      ...user,
      scopes: updatedScopes,
    };
  }
}
