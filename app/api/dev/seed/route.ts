import { NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export async function POST() {
  try {
    await dbConnect();
    
    return NextResponse.json({
      message: 'Seed route temporarily disabled during MongoDB to MySQL migration',
      status: 'skipped'
    });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Seed failed' }, { status: 400 });
  }
}







