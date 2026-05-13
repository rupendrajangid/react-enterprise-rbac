import type { User } from '@react-enterprise-rbac/core';

export const mockUsers: Record<string, User> = {
  admin: {
    id: 'admin-1',
    roles: ['admin'],
    permissions: ['*'],
    scopes: [{ type: 'org', id: 'org-1' }]
  },
  regionManager: {
    id: 'manager-1',
    roles: ['manager'],
    permissions: ['dashboard.view', 'task.view', 'task.edit'],
    scopes: [{ 
      type: 'region', 
      id: 'mumbai',
      permissions: ['task.*'] 
    }]
  },
  siteManager: {
    id: 'site-1',
    roles: ['manager'],
    permissions: ['dashboard.view'],
    scopes: [{ 
      type: 'site', 
      id: 'site-101',
      permissions: ['task.view'] 
    }]
  },
  auditor: {
    id: 'auditor-1',
    roles: ['auditor'],
    permissions: ['dashboard.view', '*.view'],
    scopes: []
  }
};
