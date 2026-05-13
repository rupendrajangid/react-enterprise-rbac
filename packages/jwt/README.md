# @react-enterprise-rbac/jwt

JWT parsing utility for the **react-enterprise-rbac** framework. Bridges your authentication tokens with the RBAC engine.

## Features

- **Token Extraction**: Automatically parses roles, permissions, and hierarchical scopes from standard JWT payloads.
- **Validation**: Ensures tokens are structurally sound for use with the `PermissionEngine`.
- **Lightweight**: Zero-dependency parser.

## Installation

```bash
npm install @react-enterprise-rbac/jwt
```

## Usage

```typescript
import { parseUserFromToken } from '@react-enterprise-rbac/jwt';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const user = parseUserFromToken(token);

console.log(user.roles);       // ['admin']
console.log(user.permissions); // ['*']
console.log(user.scopes);      // [{ type: 'org', id: 'acme', ... }]
```

## License

MIT
