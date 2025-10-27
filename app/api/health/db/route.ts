import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db-prisma';

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    if (health.status === 'error') {
      return NextResponse.json(
        { 
          ok: false, 
          status: 'error',
          error: health.error,
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      ok: true, 
      ...health,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    return NextResponse.json(
      { 
        ok: false, 
        status: 'error',
        error: e?.message || 'DB health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}










