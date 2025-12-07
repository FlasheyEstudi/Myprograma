import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken, getUserById } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
    phone?: string;
    isActive: boolean;
    createdAt: Date;
  };
}

export async function withAuth(
  request: NextRequest,
  requiredRole?: string[]
): Promise<NextResponse | { user: AuthenticatedRequest['user'] }> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    const payload = verifyAccessToken(token);
    const user = await getUserById(payload.userId);

    // Check role requirements
    if (requiredRole && !requiredRole.includes(user.role)) {
      return forbiddenResponse();
    }

    return { user };
  } catch (error) {
    return unauthorizedResponse();
  }
}

export function requireAuth(handler: (request: NextRequest, context?: any) => Promise<NextResponse>, requiredRole?: string[]) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await withAuth(request, requiredRole);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Attach user to request and call handler
    (request as any).user = authResult.user;
    return handler(request, context);
  };
}

// Role-based access control helpers
export const requireAdmin = (handler: (request: NextRequest, context?: any) => Promise<NextResponse>) => requireAuth(handler, ['ADMIN', 'SUPER_ADMIN']);
export const requireSuperAdmin = (handler: (request: NextRequest, context?: any) => Promise<NextResponse>) => requireAuth(handler, ['SUPER_ADMIN']);
export const requireUser = (handler: (request: NextRequest, context?: any) => Promise<NextResponse>) => requireAuth(handler, ['USER', 'ADMIN', 'SUPER_ADMIN']);