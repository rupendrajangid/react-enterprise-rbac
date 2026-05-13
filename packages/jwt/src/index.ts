import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  sub?: string;
  role?: string | string[];
  permissions?: string[];
  scopes?: string[];
  [key: string]: any;
}

export function parsePermissions(token: string): string[] {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.permissions || [];
  } catch {
    return [];
  }
}

export function extractUser(token: string) {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Convert scopes like "region:mumbai" to UserScope objects
    const rawScopes = decoded.scopes || [];
    const scopes = rawScopes.map(s => {
      const [type, id] = s.split(':');
      return { type, id, permissions: decoded.permissions }; // Simplified
    });

    return {
      id: decoded.sub || '',
      roles: Array.isArray(decoded.role) ? decoded.role : decoded.role ? [decoded.role] : [],
      permissions: decoded.permissions || [],
      scopes: scopes as any[]
    };
  } catch {
    return null;
  }
}
