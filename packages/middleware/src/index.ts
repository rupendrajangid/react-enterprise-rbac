import { PermissionEngine, User } from '@react-enterprise-rbac/core';

export interface MiddlewareConfig<P extends string = string> {
  engine: PermissionEngine<P>;
  getUser: (req: any) => Promise<User<P> | null>;
  onUnauthorized?: (req: any, res: any) => void;
}

export const createPermissionMiddleware = <P extends string = string>(config: MiddlewareConfig<P>) => {
  return (permission: P) => {
    return async (req: any, res: any, next: () => void) => {
      const user = await config.getUser(req);
      
      if (!user || !config.engine.can(user, permission)) {
        if (config.onUnauthorized) {
          return config.onUnauthorized(req, res);
        }
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }
      
      req.user = user;
      next();
    };
  };
};
