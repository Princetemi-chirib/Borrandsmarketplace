import { NextRequest, NextResponse } from 'next/server';
import { verifyAppRequest } from '@/lib/auth-app';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || !auth.restaurantId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ message: 'Cloudinary not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ message: 'No file' }, { status: 400 });

    // Validate file type
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ message: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 data URL for Cloudinary
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type || 'image/jpeg'};base64,${base64}`;

    // Upload to Cloudinary using promise-based API
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'borrands/food', // Organize food images in a subfolder
      resource_type: 'image', // Explicitly set to image
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' }, // Optimize image size
      ],
    });

    // Return the secure URL from Cloudinary
    return NextResponse.json({ url: result.secure_url });
  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ message: e.message || 'Upload failed' }, { status: 500 });
  }
}


















