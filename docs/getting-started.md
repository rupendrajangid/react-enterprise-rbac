# Getting Started with react-enterprise-rbac

## 1. Installation

```bash
npm install @react-enterprise-rbac/react @react-enterprise-rbac/core
```

## 2. Define your Permission Types (Optional but Recommended)

```typescript
// types/rbac.ts
export type AppPermission = 
  | 'user.view' 
  | 'user.edit' 
  | 'report.generate' 
  | 'dashboard.access'
  | '*';
```

## 3. Initialize the Provider

Wrap your application in `RBACProvider` and pass the current user.

```tsx
import { RBACProvider } from '@react-enterprise-rbac/react';
import { AppPermission } from './types/rbac';

const user = {
  id: '1',
  roles: ['admin'],
  permissions: ['dashboard.access' as AppPermission],
  scopes: [
    { type: 'region', id: 'north-america', permissions: ['*'] }
  ]
};

function App() {
  return (
    <RBACProvider<AppPermission> user={user}>
      <MainLayout />
    </RBACProvider>
  );
}
```

## 4. Use Guards in Components

### Declarative Guard

```tsx
import { Can } from '@react-enterprise-rbac/react';

function Header() {
  return (
    <Can<AppPermission> permission="user.edit">
      <button>Edit User</button>
    </Can>
  );
}
```

### Hook-based Guard

```tsx
import { usePermission } from '@react-enterprise-rbac/react';

function ReportPage() {
  const { can } = usePermission<AppPermission>();

  if (!can('report.generate')) {
    return <p>Access Denied</p>;
  }

  return <ReportView />;
}
```

## 5. Scope-Aware Access

Check if a user has access to a specific site or department.

```tsx
<ScopeGuard 
  scope="site" 
  scopeId="site-45" 
  permission="task.edit"
>
  <EditTaskButton />
</ScopeGuard>
```
