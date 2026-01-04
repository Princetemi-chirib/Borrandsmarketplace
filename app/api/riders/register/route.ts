import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Rider registration is disabled - riders are added manually by administrators
  return NextResponse.json(
    { error: 'Rider registration is currently disabled. Riders are added manually by administrators. Please contact support if you need to become a rider.' },
    { status: 403 }
  );
}
