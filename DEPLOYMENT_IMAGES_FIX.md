# Image Deployment Issues - Fix Guide

## Issues Identified

1. **File System Uploads**: The `/api/uploads` route saves files to `public/uploads`, which won't persist in serverless environments (Vercel, Netlify, etc.)

2. **Next.js Image Configuration**: Using deprecated `domains` instead of `remotePatterns`

3. **Image URL Handling**: Images may be stored as relative paths that don't work in production

## Solutions Implemented

### 1. Updated Next.js Configuration (`next.config.js`)
- Changed from `domains` to `remotePatterns` (Next.js 13+ standard)
- Added support for Cloudinary and Vercel domains
- Configured proper image optimization settings

### 2. Created Image Utility Functions (`lib/image-utils.ts`)
- `getImageUrl()`: Handles both relative and absolute image URLs
- `isValidImageUrl()`: Validates image URLs before display
- Proper fallback handling for missing images

### 3. Updated Components
- Fixed image display in restaurant menu items
- Added proper error handling for failed image loads
- Added fallback placeholders for missing images

## For Production Deployment

### Option 1: Use Cloudinary (Recommended)

1. **Sign up for Cloudinary** (free tier available)
2. **Install Cloudinary SDK**:
   ```bash
   npm install cloudinary
   ```

3. **Update `/api/uploads/route.ts`** to use Cloudinary:
   ```typescript
   import { v2 as cloudinary } from 'cloudinary';
   
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });
   
   // In POST handler:
   const result = await cloudinary.uploader.upload(buffer, {
     folder: 'borrands',
     resource_type: 'image',
   });
   
   return NextResponse.json({ url: result.secure_url });
   ```

4. **Add to `.env.local`**:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Option 2: Use Vercel Blob Storage

1. **Install Vercel Blob**:
   ```bash
   npm install @vercel/blob
   ```

2. **Update upload endpoint** to use Vercel Blob

### Option 3: Use External CDN

Store images on:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Blob Storage
- Any CDN service

## Static Images in `/public`

Static images in the `public` folder will work automatically in deployment. Make sure:
- Images are in `public/images/` or `public/` root
- References use `/images/filename.jpg` (not `/public/images/...`)
- Images are committed to git (not in `.gitignore`)

## Testing

1. **Local Testing**:
   - Upload an image through the menu management
   - Verify it displays correctly
   - Check browser console for 404 errors

2. **Production Testing**:
   - Deploy to staging/production
   - Test image uploads
   - Verify images persist after deployment
   - Check that static images load correctly

## Current Status

✅ Next.js image config updated
✅ Image utility functions created
✅ Components updated with proper image handling
⚠️ File uploads still use local filesystem (needs Cloudinary/CDN for production)

## Next Steps

1. Choose a cloud storage solution (Cloudinary recommended)
2. Update `/api/uploads/route.ts` to use cloud storage
3. Test image uploads in production
4. Verify all images display correctly

