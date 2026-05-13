# react-enterprise-rbac

<p align="center">
  <strong>Enterprise-grade hierarchical RBAC & scope authorization framework for React & TypeScript applications.</strong>
</p>

<p align="center">
  Built for modern enterprise systems with multi-tenant access control, hierarchical scope inheritance, JWT integration, and type-safe developer experience.
</p>

<p align="center">

![CI](https://github.com/rupendrajangid/react-enterprise-rbac/actions/workflows/ci.yml/badge.svg)
![npm](https://img.shields.io/npm/v/@react-enterprise-rbac/react)
![License](https://img.shields.io/npm/l/@react-enterprise-rbac/react)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB)

</p>

---

# ✨ Why react-enterprise-rbac?

Most RBAC libraries focus only on flat role-based permissions.

Enterprise applications require significantly more advanced authorization models involving:

* Hierarchical scope inheritance
* Multi-tenant access control
* Region/Area/Site-level permissions
* Declarative UI authorization
* Type-safe developer experience
* Dynamic permission resolution
* Enterprise workflow authorization

react-enterprise-rbac was built specifically to solve these enterprise authorization challenges for modern React and TypeScript applications.

---

# 🚀 Key Features

## 🔐 Enterprise Authorization

* Hierarchical scope inheritance
* Multi-organization authorization
* Downward permission propagation
* Scope-aware access control
* Wildcard permission matching
* Route-level protection

---

## ⚡ Developer Experience

* TypeScript-first APIs
* Full generic type support
* Autocompletion for permissions
* Declarative React components
* Simple hook-based API
* Tree-shakable architecture

---

## 🧩 React Integration

* `<Can />`
* `<Cannot />`
* `<ScopeGuard />`
* `<RoleGuard />`
* `<ProtectedRoute />`
* `usePermission()`
* `useScopeAccess()`

---

## 🔑 JWT Support

* JWT role parsing
* Scope extraction
* Permission decoding
* Auth token helpers

---

# 🏢 Hierarchical Scope Authorization

react-enterprise-rbac supports enterprise-grade hierarchical authorization structures.

```text
Organization
 ├── Region
 │    ├── Area
 │    │    ├── Site
 │    │    │    ├── Department
```

Permissions inherit downward automatically.

### Example

* Region Manager → Access all Areas & Sites within Region
* Site Manager → Access only assigned Site
* Auditor → Read-only access across hierarchy

---

# 📦 Installation

```bash
npm install @react-enterprise-rbac/react @react-enterprise-rbac/core
```

or

```bash
yarn add @react-enterprise-rbac/react @react-enterprise-rbac/core
```

---

# 🚀 Quick Start

## 1. Setup the Provider

```tsx
import { RBACProvider } from '@react-enterprise-rbac/react';

const user = {
  id: 'user-123',
  roles: ['manager'],
  permissions: ['dashboard.view'],
  scopes: [
    {
      type: 'region',
      id: 'mumbai',
      permissions: ['task.*']
    }
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

---

## 2. Guard Your UI

```tsx
import { Can, ScopeGuard } from '@react-enterprise-rbac/react';

function Dashboard() {
  return (
    <div>
      <Can permission="dashboard.view">
        <h1>Welcome to the Command Center</h1>
      </Can>

      <ScopeGuard
        scope="region"
        scopeId="mumbai"
        permission="task.create"
      >
        <button>Create Task in Mumbai</button>
      </ScopeGuard>
    </div>
  );
}
```

---

# 🧠 Type-Safe Permissions

Define strongly typed permission schemas with full autocompletion support.

```ts
type Permissions =
  | "task.create"
  | "task.edit"
  | "task.delete";

const { can } = usePermission<Permissions>();

can("task.create");
```

Invalid permissions are caught at compile-time.

---

# ⚡ Wildcard Permission Matching

Supports flexible wildcard authorization patterns.

```ts
can("task.*");
can("admin.*");
```

---

# 🔑 JWT Integration

Extract roles, permissions, and scopes directly from JWT tokens.

```ts
import { parseRBACJwt } from "@react-enterprise-rbac/jwt";

const auth = parseRBACJwt(token);
```

Example JWT Payload:

```json
{
  "role": "manager",
  "permissions": ["task.create"],
  "scopes": ["region:mumbai"]
}
```

---

# 🛡️ Available Components

| Component            | Description                              |
| -------------------- | ---------------------------------------- |
| `<Can />`            | Render content when permission exists    |
| `<Cannot />`         | Render content when permission is denied |
| `<ScopeGuard />`     | Restrict rendering by scope              |
| `<RoleGuard />`      | Restrict rendering by role               |
| `<ProtectedRoute />` | Route-level authorization                |

---

# 🪝 Available Hooks

| Hook               | Description                |
| ------------------ | -------------------------- |
| `usePermission()`  | Permission checking        |
| `useScopeAccess()` | Scope-aware access control |
| `useCurrentUser()` | Current authenticated user |
| `useRBAC()`        | Full RBAC engine access    |

---

# 🏗️ Monorepo Architecture

```text
react-enterprise-rbac/
├── docs/
│   ├── architecture.md
│   └── getting-started.md
├── packages/
│   ├── core/
│   ├── react/
│   ├── jwt/
│   └── middleware/
├── apps/
│   └── demo/
└── README.md
```

---

# ⚙️ Tech Stack

* React
* TypeScript
* Turborepo
* tsup
* Vitest
* ESLint
* Prettier
* Husky
* GitHub Actions

---

# 🧪 Development

## Install Dependencies

```bash
npm install
```

## Build Packages

```bash
npm run build
```

## Run Demo App

```bash
npm run dev --workspace=apps/demo
```

## Run Tests

```bash
npm run test
```

---

# 🏢 Primary Use Cases

* Enterprise Dashboards
* Manufacturing Systems (MES)
* ERP Platforms
* Workflow Management Systems
* SaaS Multi-tenant Applications
* Multi-location Access Control
* Enterprise Admin Panels

---

# 🗺️ Roadmap

## Upcoming Features

* [ ] Attribute-Based Access Control (ABAC)
* [ ] Permission visualizer
* [ ] Audit logs
* [ ] Backend adapters
* [ ] NestJS integration
* [ ] Next.js middleware
* [ ] Graph-based hierarchy engine
* [ ] Developer Devtools

---

# 🤝 Contributing

Contributions are welcome.

Please read the upcoming `CONTRIBUTING.md` guide before submitting pull requests.

---

# 📄 License

MIT © Rupendra Kumar Jangid

---

# ❤️ Built for Enterprise React Applications

If this project helps you, consider starring the repository and contributing to the ecosystem.
