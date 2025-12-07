import { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyPassword, generateTokens, getUserByEmail } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { loginSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Get user with password hash
    const user = await getUserByEmail(email);

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return errorResponse(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return successResponse('Login successful', {
      user: userWithoutPassword,
      tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Login error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}