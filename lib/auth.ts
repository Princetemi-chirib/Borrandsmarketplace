import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

export interface JWTPayload {
  userId: string;
  email?: string;
  role: string;
  university: string;
  restaurantId?: string;
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user._id,
    role: user.role,
    university: (user as any).university,
    // Optional fields if present on user
    email: (user as any).email,
    restaurantId: (user as any).restaurantId,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function authenticateUser(req: NextApiRequest, res: NextApiResponse): JWTPayload | null {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return null;
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return null;
  }

  return payload;
}

export function requireRole(allowedRoles: string[]) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const payload = authenticateUser(req, res);
    
    if (!payload) {
      return;
    }

    if (!allowedRoles.includes(payload.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    req.user = payload;
    next();
  };
}

export function requireAuth(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const payload = authenticateUser(req, res);
  
  if (!payload) {
    return;
  }

  req.user = payload;
  next();
}

// Extend NextApiRequest to include user
declare module 'next' {
  interface NextApiRequest {
    user?: JWTPayload;
  }
}

// Cookie-based auth helpers for App Router (route handlers)
export const AUTH_COOKIE_NAME = 'borrands_token';

export function createAuthCookie(token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export function setAuthCookieOnResponse(res: NextResponse, token: string) {
  const cookie = createAuthCookie(token);
  res.cookies.set(cookie);
  return res;
}

export function clearAuthCookieOnResponse(res: NextResponse) {
  res.cookies.set({ name: AUTH_COOKIE_NAME, value: '', maxAge: 0, path: '/' });
  return res;
}

export function getAuthTokenFromNextRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookie) return cookie;
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.substring(7);
  return null;
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getAuthTokenFromNextRequest(request);
  if (!token) return null;
  return verifyToken(token);
}





