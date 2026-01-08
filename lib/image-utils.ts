/**
 * Image utility functions for handling image URLs in deployment
 */

/**
 * Get the full image URL, handling both relative and absolute paths
 * @param imageUrl - The image URL from the database (can be relative or absolute)
 * @returns Full URL for the image
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return ''; // Return empty string for no image
  }

  // If it's already an absolute URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a Cloudinary URL (starts with cloudinary:// or res.cloudinary.com)
  if (imageUrl.includes('cloudinary.com') || imageUrl.startsWith('cloudinary://')) {
    // Convert cloudinary:// to https:// if needed
    if (imageUrl.startsWith('cloudinary://')) {
      return imageUrl.replace('cloudinary://', 'https://');
    }
    return imageUrl;
  }

  // For relative paths (starting with /), prepend the base URL in production
  if (imageUrl.startsWith('/')) {
    // In production, you might need to prepend your domain
    // For now, return as-is (Next.js will handle /public paths automatically)
    return imageUrl;
  }

  // If it doesn't start with /, assume it's a relative path and add /
  return `/${imageUrl}`;
}

/**
 * Check if an image URL is valid and should be displayed
 * @param imageUrl - The image URL to check
 * @returns true if the image should be displayed
 */
export function isValidImageUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl || imageUrl.trim() === '') {
    return false;
  }

  // Filter out placeholder/default images
  const invalidPaths = [
    '/images/default-restaurant.jpg',
    '/images/default.jpg',
    'default-restaurant.jpg',
    'default.jpg',
  ];

  return !invalidPaths.some(path => imageUrl.includes(path));
}

/**
 * Get a placeholder image URL
 * @returns Placeholder image URL
 */
export function getPlaceholderImage(): string {
  return '/images/placeholder.jpg'; // You can add a placeholder image to public/images/
}






