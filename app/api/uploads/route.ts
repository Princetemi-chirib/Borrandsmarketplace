import { NextRequest, NextResponse } from 'next/server';
import { verifyAppRequest } from '@/lib/auth-app';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || !auth.restaurantId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Check if Cloudinary is configured with detailed error messages
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      const missing = [];
      if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
      if (!apiKey) missing.push('CLOUDINARY_API_KEY');
      if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
      
      console.error('Cloudinary configuration missing:', missing.join(', '));
      return NextResponse.json({ 
        message: `Cloudinary not configured. Missing: ${missing.join(', ')}. Please check your environment variables.` 
      }, { status: 500 });
    }

    // Validate cloud name is not empty
    if (cloudName.trim() === '') {
      console.error('Cloudinary cloud name is empty');
      return NextResponse.json({ 
        message: 'Invalid Cloudinary cloud name. CLOUDINARY_CLOUD_NAME cannot be empty.' 
      }, { status: 500 });
    }

    // Configure Cloudinary with validated credentials
    cloudinary.config({
      cloud_name: cloudName.trim(),
      api_key: apiKey.trim(),
      api_secret: apiSecret.trim(),
    });

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
    
    // Provide more specific error messages
    let errorMessage = 'Upload failed';
    if (e.message) {
      if (e.message.includes('Invalid cloud name') || e.message.includes('cloud name')) {
        errorMessage = `Invalid Cloudinary cloud name. Please check your CLOUDINARY_CLOUD_NAME environment variable. Current value: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Set (but invalid)' : 'Not set'}`;
      } else if (e.message.includes('Invalid API key')) {
        errorMessage = 'Invalid Cloudinary API key. Please check your CLOUDINARY_API_KEY environment variable.';
      } else if (e.message.includes('Invalid API secret')) {
        errorMessage = 'Invalid Cloudinary API secret. Please check your CLOUDINARY_API_SECRET environment variable.';
      } else {
        errorMessage = e.message;
      }
    }
    
    return NextResponse.json({ 
      message: errorMessage,
      error: e.message 
    }, { status: 500 });
  }
}


















