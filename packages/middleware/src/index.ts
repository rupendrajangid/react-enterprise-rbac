import { PermissionEngine, User, ScopeType, AccessContext } from '@react-enterprise-rbac/core';


export interface MiddlewareConfig<P extends string = string> {
  engine: PermissionEngine<P>;
  getUser: (req: any) => Promise<User<P> | null>;
  onUnauthorized?: (req: any, res: any) => void;
}

export interface MiddlewareOptions<P extends string = string> {
  permission?: P;
  anyOf?: P[];
  allOf?: P[];
  scope?: ScopeType;
  // Function to extract scopeId from request (e.g. req.params.id)
  getScopeId?: (req: any) => string;
  // Function to extract context from request
  getContext?: (req: any) => AccessContext;
}

export const createPermissionMiddleware = <P extends string = string>(config: MiddlewareConfig<P>) => {
  return (options: P | MiddlewareOptions<P>) => {
    const opts = typeof options === 'string' ? { permission: options } : options;

    return async (req: any, res: any, next: () => void) => {
      const user = await config.getUser(req);
      if (!user) {
        return config.onUnauthorized ? config.onUnauthorized(req, res) : res.status(401).json({ error: 'Unauthenticated' });
      }

      const context = opts.getContext ? opts.getContext(req) : {};
      const scopeId = opts.getScopeId ? opts.getScopeId(req) : undefined;
      
      let allowed = false;

      if (opts.permission) {
        if (opts.scope && scopeId) {
          allowed = config.engine.canAccess(user, { 
            permission: opts.permission, 
            scope: opts.scope, 
            scopeId,
            context 
          });
        } else {
          allowed = config.engine.can(user, opts.permission, context);
        }
      } else if (opts.anyOf) {
        allowed = config.engine.canAny(user, opts.anyOf, context);
      } else if (opts.allOf) {
        allowed = config.engine.canAll(user, opts.allOf, context);
      }

      if (!allowed) {
        if (config.onUnauthorized) {
          return config.onUnauthorized(req, res);
        }
        return res.status(403).json({ error: 'Unauthorized', required: opts.permission || opts.anyOf || opts.allOf });
      }
      
      req.user = user;
      next();
    };
  };
};

