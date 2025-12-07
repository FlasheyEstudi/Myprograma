import { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyRefreshToken, generateTokens, getUserById } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { refreshTokenSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = refreshTokenSchema.parse(body);

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Get user to ensure they're still active
    const user = await getUserById(payload.userId);

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse('Tokens refreshed successfully', {
      tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Token refresh error:', error);
    return errorResponse(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }
}