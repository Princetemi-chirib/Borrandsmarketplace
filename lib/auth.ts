import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  university: string;
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    university: user.university,
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


