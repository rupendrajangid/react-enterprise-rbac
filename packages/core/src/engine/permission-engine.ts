import { User, AccessRequest, ScopeType, defaultHierarchy, AccessContext, Condition } from '../types';
import { evaluateConditions } from '../utils/condition-evaluator';


export class PermissionEngine<P extends string = string> {
  private hierarchy = defaultHierarchy;
  private cache: Map<string, { allow: boolean; reason: string }> = new Map();
  private useCache = false;
  private globalPolicies: { permission: P; conditions?: Condition[] }[] = [];
  private onDecision?: (decision: { 
    user: string; 
    request: AccessRequest<P>; 
    result: { allow: boolean; reason: string };
    timestamp: number;
  }) => void;

  constructor(config?: { 
    hierarchy?: Record<ScopeType, number>, 
    enableCache?: boolean,
    onDecision?: (decision: any) => void,
    globalPolicies?: { permission: P; conditions?: Condition[] }[]
  }) {
    if (config?.hierarchy) {
      this.hierarchy = config.hierarchy;
    }
    this.useCache = !!config?.enableCache;
    this.onDecision = config?.onDecision;
    this.globalPolicies = config?.globalPolicies || [];
  }



  /**
   * Clear the permission cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }


  /**
   * Check if user has a specific permission globally.
   * Supports wildcards (e.g., 'task.*' matches 'task.create')
   * Supports explicit deny (e.g., '-task.delete' overrides any allow)
   */
  public can(user: User<P>, permission: P, context?: AccessContext): boolean {
    const result = this.evaluate(user.permissions, user.conditions, permission, context);
    return result.allow;
  }

  /**
   * Detailed check with explanation.
   */
  public explain(user: User<P>, request: AccessRequest<P>): { allow: boolean; reason: string } {
    const { permission, scope, scopeId, context } = request;
    
    const cacheKey = this.useCache 
      ? `${user.id}:${permission}:${scope}:${scopeId}:${JSON.stringify(context || {})}`
      : null;

    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = this.evaluateAccess(user, request);
    
    if (cacheKey) {
      this.cache.set(cacheKey, result);
    }

    if (this.onDecision) {
      this.onDecision({
        user: user.id,
        request,
        result,
        timestamp: Date.now()
      });
    }

    return result;
  }


  private evaluateAccess(user: User<P>, request: AccessRequest<P>): { allow: boolean; reason: string } {
    const { permission, scope, scopeId, context } = request;

    // 1. Check global
    if (permission) {
      const global = this.evaluate(user.permissions, user.conditions, permission, context);
      if (!global.allow && global.reason.includes('explicitly denied')) {
        return global;
      }
      if (global.allow) return global;
    }

    // 2. Check scopes
    if (scope && scopeId) {
      const userScope = user.scopes.find((s) => s.type === scope && s.id === scopeId);
      if (userScope) {
        if (!permission) return { allow: true, reason: `Access granted to scope ${scope}:${scopeId}` };
        
        const scopeResult = this.evaluate(userScope.permissions || [], userScope.conditions, permission, context);
        if (scopeResult.allow || scopeResult.reason.includes('explicitly denied')) {
          return scopeResult;
        }
      }

      // 3. Hierarchy
      const parentScopes = user.scopes.filter(
        (s) => this.hierarchy[s.type] < this.hierarchy[scope]
      );
      
      for (const parent of parentScopes) {
        if (permission) {
          const parentResult = this.evaluate(parent.permissions || [], parent.conditions, permission, context);
          if (parentResult.allow || parentResult.reason.includes('explicitly denied')) {
            return { ...parentResult, reason: `Inherited from ${parent.type}:${parent.id}: ${parentResult.reason}` };
          }
        } else {
          return { allow: true, reason: `Access granted via parent scope ${parent.type}:${parent.id}` };
        }
      }
    }

    return { allow: false, reason: 'No matching permission found' };
  }

  /**
   * Check if user has access to a specific scope/resource.
   */
  public canAccess(user: User<P>, request: AccessRequest<P>): boolean {
    return this.explain(user, request).allow;
  }

  private evaluate(
    permissions: P[],
    conditionsMap: Record<string, Condition[]> | undefined,
    target: P,
    context?: AccessContext
  ): { allow: boolean; reason: string } {
    // 1. Check for explicit deny first
    const denyMatch = permissions.find(p => {
      const pStr = p as string;
      if (!pStr.startsWith('-')) return false;
      return this.isMatch(pStr.substring(1) as P, target);
    });

    if (denyMatch) {
      return { allow: false, reason: `Permission '${target}' is explicitly denied by '${denyMatch}'` };
    }

    // 2. Check global system-wide policies
    const policy = this.globalPolicies.find(p => this.isMatch(p.permission, target));
    if (policy) {
      if (!policy.conditions || evaluateConditions(policy.conditions, context || {})) {
        return { allow: true, reason: `Permission '${target}' allowed by global policy` };
      }
    }

    // 3. Check for user-specific allow match
    const allowMatch = permissions.find(p => this.isMatch(p, target));

    
    if (allowMatch) {
      const conditions = conditionsMap?.[allowMatch as string];
      if (conditions && !evaluateConditions(conditions, context || {})) {
        return { allow: false, reason: `Permission '${target}' matched '${allowMatch}' but conditions failed` };
      }
      return { allow: true, reason: `Permission '${target}' allowed by '${allowMatch}'` };
    }

    return { allow: false, reason: `No rule found for '${target}'` };
  }

  private isMatch(pattern: P, target: P): boolean {
    const p = pattern as string;
    const t = target as string;
    if (p === t || p === '*') return true;
    if (p.endsWith('.*')) {
      const prefix = p.slice(0, -2);
      return t.startsWith(prefix);
    }
    return false;
  }

  private matchPermission(userPermissions: P[], target: P): boolean {
    return userPermissions.some((p) => this.isMatch(p, target));
  }

  /**
   * Filter a list of items based on permissions and conditions.
   * Useful for list-level access control.
   */
  public filter<T>(user: User<P>, permission: P, items: T[], baseContext: AccessContext = {}): T[] {
    return items.filter((item) => {
      // Merge item data into context for condition evaluation
      const context = { ...baseContext, ...(item as any) };
      return this.can(user, permission, context);
    });
  }

  /**
   * Project (mask) an object's fields based on permissions.
   * If a field-specific permission is missing, the field is removed.
   * Expects permissions in format 'resource.field'
   */
  public project<T extends object>(user: User<P>, resource: string, data: T, baseContext: AccessContext = {}): Partial<T> {
    const result: any = {};
    const keys = Object.keys(data) as (keyof T)[];

    for (const key of keys) {
      const permission = `${resource}.${String(key)}` as P;
      const context = { ...baseContext, ...(data as any) };
      
      if (this.can(user, permission, context)) {
        result[key] = data[key];
      }
    }

    return result;
  }

  /**
   * Check if user has ALL of the specified permissions.
   */
  public canAll(user: User<P>, permissions: P[], context?: AccessContext): boolean {
    return permissions.every(p => this.can(user, p, context));
  }

  /**
   * Check if user has ANY of the specified permissions.
   */
  public canAny(user: User<P>, permissions: P[], context?: AccessContext): boolean {
    return permissions.some(p => this.can(user, p, context));
  }

}

export const createPermissionEngine = <P extends string = string>(config?: { 
  hierarchy?: Record<ScopeType, number>, 
  enableCache?: boolean,
  onDecision?: (decision: any) => void,
  globalPolicies?: { permission: P; conditions?: Condition[] }[]
}) => {
  return new PermissionEngine<P>(config);
};



