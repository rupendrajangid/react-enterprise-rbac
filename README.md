# react-enterprise-rbac

[![CI](https://github.com/rupendrajangid/react-enterprise-rbac/actions/workflows/ci.yml/badge.svg)](https://github.com/rupendrajangid/react-enterprise-rbac/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/react-enterprise-rbac.svg)](https://www.npmjs.com/package/react-enterprise-rbac)
[![License](https://img.shields.io/npm/l/react-enterprise-rbac.svg)](https://github.com/rupendrajangid/react-enterprise-rbac/blob/main/LICENSE)

**react-enterprise-rbac** is a production-grade TypeScript-first authorization framework for React applications that solves enterprise hierarchical access control challenges commonly missing in existing RBAC libraries.

The library supports multi-organization scope inheritance across **Organization → Region → Area → Site → Department** structures, enabling enterprise applications to implement scalable permission management with downward access inheritance.

## 🚀 Key Features

- **Hierarchical Scopes**: Multi-org scope inheritance (Org > Region > Area > Site > Department).
- **React Components**: Declarative `<Can />`, `<Cannot />`, and `<ScopeGuard />` components.
- **JWT Integration**: Native JWT-based role and scope parsing.
- **Route Protection**: Integrated route guards for React Router and Next.js.
- **Wildcard Permissions**: Flexible permission matching using wildcards (e.g., `task.*`).
- **TypeScript-First**: Strongly typed APIs with full autocompletion and inferable types.
- **Tree-shakable**: Modern monorepo architecture for optimized bundle sizes.

## 📦 Installation

```bash
npm install @react-enterprise-rbac/react @react-enterprise-rbac/core
```

## 🛠️ Quick Start

### 1. Setup the Provider

```tsx
import { RBACProvider } from '@react-enterprise-rbac/react';

const user = {
  id: 'user-123',
  roles: ['manager'],
  permissions: ['dashboard.view'],
  scopes: [
    { type: 'region', id: 'mumbai', permissions: ['task.*'] }
  ]
};

function App() {
  return (
    <RBACProvider user={user}>
      <Dashboard />
    </RBACProvider>
  );
}
```

### 2. Guard your UI

```tsx
import { Can, ScopeGuard } from '@react-enterprise-rbac/react';

function Dashboard() {
  return (
    <div>
      <Can permission="dashboard.view">
        <h1>Welcome to the Command Center</h1>
      </Can>

      <ScopeGuard scope="region" scopeId="mumbai" permission="task.create">
        <button className="btn-primary">Create Task in Mumbai</button>
      </ScopeGuard>
    </div>
  );
}
```

## 🏗️ Architecture

The framework is built as a set of decoupled, tree-shakable packages:

- **`@react-enterprise-rbac/core`**: The engine for permission matching and hierarchy traversal.
- **`@react-enterprise-rbac/react`**: React-specific bindings, providers, and UI guards.
- **`@react-enterprise-rbac/jwt`**: Utilities for parsing permissions from standard JWT tokens.
- **`@react-enterprise-rbac/middleware`**: Server-side helpers for permission checks.

## 🏢 Primary Use Cases

- **Enterprise Dashboards**
- **Manufacturing Systems (MES)**
- **Multi-location ERP Systems**
- **SaaS Multi-tenant Platforms**

## 📄 License

MIT © [Rupendra Kumar Jangid](https://github.com/rupendrajangid)