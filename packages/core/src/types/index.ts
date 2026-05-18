export type Permission = string;
export type AccessContext = Record<string, any>;

export type Operator = 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex' | 'exists';

export interface Condition {
  field?: string;
  operator?: Operator;
  value?: any;
  and?: Condition[];
  or?: Condition[];
  not?: Condition;
}


export type ScopeType = 'org' | 'region' | 'area' | 'site' | 'department';

export interface UserScope<P extends string = string> {
  type: ScopeType;
  id: string;
  permissions?: P[];
  conditions?: Record<P, Condition[]>;
}


export interface User<P extends string = string> {
  id: string;
  roles: string[];
  permissions: P[];
  scopes: UserScope<P>[];
  conditions?: Record<P, Condition[]>;
}

export interface AccessRequest<P extends string = string> {
  action?: string;
  permission?: P;
  scope?: ScopeType;
  scopeId?: string;
  context?: AccessContext;
}


export interface Role<P extends string = string> {
  name: string;
  permissions: P[];
  inherits?: string[];
}

export interface RBACConfig<P extends string = string> {
  hierarchy: Record<ScopeType, number>;
  roles?: Role<P>[];
}

export const defaultHierarchy: Record<ScopeType, number> = {
  org: 1,
  region: 2,
  area: 3,
  site: 4,
  department: 5,
};
