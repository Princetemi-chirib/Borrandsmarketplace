import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export interface JWTPayloadApp {
  sub: string;
  role: 'student' | 'restaurant' | 'rider' | 'admin';
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
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayloadApp;
    return decoded;
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


