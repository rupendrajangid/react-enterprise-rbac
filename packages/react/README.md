# @react-enterprise-rbac/react

React integration for the **react-enterprise-rbac** framework. Provides context providers, hooks, and declarative UI guards for hierarchical authorization.

## Features

- **RBACProvider**: Simple setup to hydrate your app with user permissions and scopes.
- **Hooks**: `usePermission`, `useScopeAccess`, and `useCurrentUser` for logic-based checks.
- **UI Guards**: `<Can />`, `<Cannot />`, and `<ScopeGuard />` for declarative rendering.
- **Route Protection**: `<ProtectedRoute />` for secure navigation.
- **Type-Safe**: Full generic support for your custom permission types.

## Installation

```bash
npm install @react-enterprise-rbac/react @react-enterprise-rbac/core
```

## Usage

```tsx
import { RBACProvider, Can, ScopeGuard } from '@react-enterprise-rbac/react';

function App() {
  return (
    <RBACProvider user={currentUser} config={rbacConfig}>
      <Dashboard />
    </RBACProvider>
  );
}

function Dashboard() {
  return (
    <div>
      <Can permission="admin.panel">
        <AdminSettings />
      </Can>

      <ScopeGuard scope="site" scopeId="NYC-01" permission="inventory.edit">
        <EditInventoryButton />
      </ScopeGuard>
    </div>
  );
}
```

## License

MIT
