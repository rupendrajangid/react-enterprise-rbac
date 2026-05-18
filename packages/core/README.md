# @react-enterprise-rbac/core

The foundational authorization engine for the **react-enterprise-rbac** framework. It provides a high-performance, TypeScript-first implementation of hierarchical scope-based access control.

## Features

- **Hierarchical Scopes**: Natural inheritance across structures like `Org > Region > Area > Site > Dept`.
- **Wildcard & Deny Matching**: Support for `*`, `prefix.*`, and explicit `-deny` patterns.
- **Advanced ABAC**: Support for nested logical conditions (`and`, `or`, `not`) and custom operators.
- **Diagnostic Engine**: Built-in `explain()` method for transparent authorization logic.
- **Role Inheritance**: Flexible role-based permission flattening.
- **Performance Optimized**: Optional built-in caching for high-frequency checks.
- **Generic-First**: Full type safety for your custom permission enums or string unions.
- **Zero Dependencies**: Lightweight and tree-shakable.


## Installation

```bash
npm install @react-enterprise-rbac/core
```

## Usage

```typescript
import { PermissionEngine } from '@react-enterprise-rbac/core';

const engine = new PermissionEngine({
  hierarchy: {
    org: 1,
    region: 2,
    area: 3,
    site: 4,
    department: 5
  }
});

const user = {
  id: 'u1',
  roles: ['manager'],
  permissions: ['report.view'],
  scopes: [
    { type: 'region', id: 'north', permissions: ['inventory.*'] }
  ]
};

// Check direct permission
engine.can(user, 'report.view'); // true

// Check hierarchical scope permission
engine.canAccess(user, { 
  scope: 'site', 
  scopeId: 'london-01', 
  permission: 'inventory.edit' 
}); // true (inherited from region)
```

## License

MIT
