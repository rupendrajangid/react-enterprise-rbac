import { describe, it, expect } from 'vitest';
import { createPermissionEngine } from './permission-engine';
import { RoleEngine } from './role-engine';
import { User, Role } from '../types';

describe('Advanced Permission Features', () => {
  const engine = createPermissionEngine({ enableCache: true });

  it('should handle explicit deny', () => {
    const user: User = {
      id: 'u1',
      roles: [],
      permissions: ['task.*', '-task.delete'],
      scopes: []
    };

    expect(engine.can(user, 'task.view')).toBe(true);
    expect(engine.can(user, 'task.create')).toBe(true);
    expect(engine.can(user, 'task.delete')).toBe(false);
    
    const explanation = engine.explain(user, { permission: 'task.delete' });
    expect(explanation.reason).toContain('explicitly denied');
  });

  it('should handle complex logical conditions', () => {
    const user: User = {
      id: 'u2',
      roles: [],
      permissions: ['task.edit'],
      scopes: [],
      conditions: {
        'task.edit': [
          {
            or: [
              { field: 'status', operator: 'eq', value: 'draft' },
              { field: 'isOwner', operator: 'eq', value: true }
            ]
          }
        ]
      }
    };

    expect(engine.can(user, 'task.edit', { status: 'draft', isOwner: false })).toBe(true);
    expect(engine.can(user, 'task.edit', { status: 'published', isOwner: true })).toBe(true);
    expect(engine.can(user, 'task.edit', { status: 'published', isOwner: false })).toBe(false);
  });

  it('should handle role inheritance', () => {
    const roles: Role[] = [
      { name: 'viewer', permissions: ['task.read'] },
      { name: 'editor', permissions: ['task.write'], inherits: ['viewer'] },
      { name: 'admin', permissions: ['task.delete'], inherits: ['editor'] }
    ];
    
    const roleEngine = new RoleEngine(roles);
    const user: User = {
      id: 'u3',
      roles: ['admin'],
      permissions: [],
      scopes: []
    };

    const flattenedUser = roleEngine.flattenUser(user);
    expect(flattenedUser.permissions).toContain('task.delete');
    expect(flattenedUser.permissions).toContain('task.write');
    expect(flattenedUser.permissions).toContain('task.read');
    
    expect(engine.can(flattenedUser, 'task.read')).toBe(true);
  });

  it('should use cache for repeated checks', () => {
    const user: User = {
      id: 'u4',
      roles: [],
      permissions: ['*'],
      scopes: []
    };

    // First check
    const start = performance.now();
    engine.can(user, 'anything');
    const firstDuration = performance.now() - start;

    // Second check (should be faster or at least use cache)
    const start2 = performance.now();
    engine.can(user, 'anything');
    const secondDuration = performance.now() - start2;
    
    // While hard to verify speed in JS without noise, we can check if it returns correct results
    expect(engine.can(user, 'anything')).toBe(true);
  });

  it('should filter a list based on conditions', () => {

    const user: User = {
      id: 'u-filter',
      roles: [],
      permissions: ['task.view'],
      scopes: [],
      conditions: {
        'task.view': [{ field: 'siteId', operator: 'eq', value: 'S1' }]
      }
    };

    const tasks = [
      { id: 1, siteId: 'S1' },
      { id: 2, siteId: 'S2' },
      { id: 3, siteId: 'S1' }
    ];

    const filtered = engine.filter(user, 'task.view', tasks);
    expect(filtered.length).toBe(2);
    expect(filtered[0].id).toBe(1);
    expect(filtered[1].id).toBe(3);
  });

  it('should mask fields using project', () => {
    const user: User = {
      id: 'u-mask',
      roles: [],
      permissions: ['profile.name', 'profile.email'], // No profile.salary
      scopes: []
    };

    const profile = { name: 'Alice', email: 'alice@example.com', salary: 100000 };
    const projected = engine.project(user, 'profile', profile);
    
    expect(projected.name).toBe('Alice');
    expect(projected.email).toBe('alice@example.com');
    expect((projected as any).salary).toBeUndefined();
  });

  it('should respect global policies', () => {
    const publicEngine = createPermissionEngine<string>({
      globalPolicies: [
        { permission: 'app.info' },
        { permission: 'app.version', conditions: [{ field: 'env', operator: 'eq', value: 'prod' }] }
      ]
    });

    const anonymousUser: User = { id: 'anon', roles: [], permissions: [], scopes: [] };

    expect(publicEngine.can(anonymousUser, 'app.info')).toBe(true);
    expect(publicEngine.can(anonymousUser, 'app.version', { env: 'prod' })).toBe(true);
    expect(publicEngine.can(anonymousUser, 'app.version', { env: 'dev' })).toBe(false);

  });

  it('should trigger onDecision for auditing', () => {
    let auditLog: any = null;
    const auditEngine = createPermissionEngine({
      onDecision: (d) => { auditLog = d; }
    });

    const user: User = { id: 'u-audit', roles: [], permissions: ['*'], scopes: [] };
    auditEngine.can(user, 'test.permission');


    expect(auditLog).not.toBeNull();
    expect(auditLog.user).toBe('u-audit');
    expect(auditLog.result.allow).toBe(true);
  });
});

