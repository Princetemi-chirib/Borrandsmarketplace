import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export interface JWTPayloadApp {
  sub: string;
  role: 'STUDENT' | 'RESTAURANT' | 'RIDER' | 'ADMIN';
  restaurantId?: string;
  iat?: number;
  exp?: number;
}

export function getBearerTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function verifyAppRequest(req: NextRequest): JWTPayloadApp | null {
  const token = getBearerTokenFromRequest(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // Handle both token formats: JWTPayload (userId) and JWTPayloadApp (sub)
    const payload: JWTPayloadApp = {
      sub: decoded.sub || decoded.userId, // Support both formats
      role: decoded.role,
      restaurantId: decoded.restaurantId,
      iat: decoded.iat,
      exp: decoded.exp
    };
    return payload;
  } catch {
    return null;
  }
}

export function verifyAppTokenString(token: string | null | undefined): JWTPayloadApp | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayloadApp;
    return decoded;
  } catch {
    return null;
  }
}


