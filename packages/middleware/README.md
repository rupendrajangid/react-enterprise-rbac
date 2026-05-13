# @react-enterprise-rbac/middleware

Server-side authorization middleware for the **react-enterprise-rbac** framework. Provides consistent permission enforcement for Node.js backends.

## Features

- **Express/Connect Compatible**: Easy integration with popular Node.js frameworks.
- **Engine Reuse**: Uses the same `PermissionEngine` logic as the frontend for 100% consistency.
- **Typed Permissions**: Support for generic permission types across your stack.

## Installation

```bash
npm install @react-enterprise-rbac/middleware @react-enterprise-rbac/core
```

## Usage

```typescript
import { createPermissionMiddleware } from '@react-enterprise-rbac/middleware';
import { PermissionEngine } from '@react-enterprise-rbac/core';

const engine = new PermissionEngine({ /* config */ });

const checkPermission = createPermissionMiddleware({
  engine,
  getUser: async (req) => req.user, // Logic to retrieve user from request
  onUnauthorized: (req, res) => res.status(403).send('Forbidden')
});

app.get('/api/reports', checkPermission('reports.view'), (req, res) => {
  res.json({ data: '...' });
});
```

## License

MIT
