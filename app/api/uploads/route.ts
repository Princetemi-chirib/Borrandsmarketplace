import { NextRequest, NextResponse } from 'next/server';
import { verifyAppRequest } from '@/lib/auth-app';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || !auth.restaurantId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ message: 'No file' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg','jpeg','png','webp'].includes(ext) ? ext : 'jpg';
    const filename = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${safeExt}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}










