import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { 
  hashPassword, 
  verifyPassword, 
  generateTokens, 
  getUserByEmail,
  AuthError 
} from '@/lib/auth';
import { 
  successResponse, 
  errorResponse, 
  conflictResponse 
} from '@/lib/api-response';
import { registerSchema, loginSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return conflictResponse('User with this email already exists');
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse('User registered successfully', {
      user,
      tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Registration error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}