import { describe, it, expect } from 'vitest';
import { createPermissionEngine } from './permission-engine';
import { User } from '../types';

describe('PermissionEngine', () => {
  const engine = createPermissionEngine();

  const user: User = {
    id: 'user-1',
    roles: ['manager'],
    permissions: ['task.view', 'report.*'],
    scopes: [
      { 
        type: 'region', 
        id: 'mumbai', 
        permissions: ['task.edit'] 
      }
    ]
  };

  it('should match direct permissions', () => {
    expect(engine.can(user, 'task.view')).toBe(true);
  });

  it('should match wildcard permissions', () => {
    expect(engine.can(user, 'report.create')).toBe(true);
    expect(engine.can(user, 'report.delete')).toBe(true);
    expect(engine.can(user, 'task.edit')).toBe(false); // Global check
  });

  it('should match scope-specific permissions', () => {
    expect(engine.canAccess(user, { 
      permission: 'task.edit', 
      scope: 'region', 
      scopeId: 'mumbai' 
    })).toBe(true);
  });

  it('should inherit permissions downward', () => {
    // User has access to region 'mumbai', so they should have access to a site in 'mumbai'
    // Note: The current implementation assumes inheritance if the user has parent scope access
    expect(engine.canAccess(user, { 
      permission: 'task.edit', 
      scope: 'site', 
      scopeId: 'site-101' 
    })).toBe(true);
  });
});
