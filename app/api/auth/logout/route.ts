import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookieOnResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  clearAuthCookieOnResponse(res);
  return res;
}


