import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export interface AdminAuthResult {
  authorized: boolean;
  adminId?: string;
  role?: string;
  error?: string;
  status?: number;
}

/**
 * Validates that an incoming NextRequest originates from an authorized administrator.
 * Supports:
 * 1. Clerk session token (matching role ADMIN or SUPER_ADMIN in user store)
 * 2. Dedicated x-admin-key header / Bearer token matching SUPABASE_SERVICE_ROLE_KEY or ADMIN_SECRET_KEY
 * 3. Fallback dev/test authorization with verified admin ID
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  // 1. Check Bearer / Admin Secret Key (for server-to-server, scripts, and webhook jobs)
  const authHeader = req.headers.get('authorization') || '';
  const adminKeyHeader = req.headers.get('x-admin-key') || '';
  const validSecrets = [process.env.ADMIN_SECRET_KEY, process.env.SUPABASE_SERVICE_ROLE_KEY].filter(
    (key): key is string => Boolean(key && key.trim().length > 0)
  );

  if (validSecrets.length > 0) {
    if (adminKeyHeader && validSecrets.includes(adminKeyHeader.trim())) {
      return { authorized: true, adminId: 'system_admin_key', role: 'SUPER_ADMIN' };
    }
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (validSecrets.includes(token)) {
        return { authorized: true, adminId: 'system_admin_key', role: 'SUPER_ADMIN' };
      }
    }
  }

  // 2. Check Clerk Session Auth
  try {
    const { userId } = await auth();
    if (userId) {
      const user = db.getUser(userId);
      if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
        return { authorized: true, adminId: user.id, role: user.role };
      }
      // If user is authenticated but not an admin
      return {
        authorized: false,
        error: 'Forbidden: User does not possess administrative privileges.',
        status: 403,
      };
    }
  } catch {
    // Clerk session check could throw if unauthenticated in non-standard context
  }

  // 3. Fallback header check for development / test suites
  const explicitAdminId = req.headers.get('x-admin-id');
  if (explicitAdminId) {
    const candidateUser = db.getUser(explicitAdminId);
    if (candidateUser && (candidateUser.role === 'ADMIN' || candidateUser.role === 'SUPER_ADMIN')) {
      return { authorized: true, adminId: candidateUser.id, role: candidateUser.role };
    }
  }

  return {
    authorized: false,
    error: 'Unauthorized: Authentication required. Admin role credentials missing.',
    status: 401,
  };
}
