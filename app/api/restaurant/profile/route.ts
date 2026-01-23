import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

// Helper to escape SQL string values
function escapeSQL(value: string): string {
  if (value === null || value === undefined) return 'NULL';
  return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
}

// Helper to parse JSON fields safely
function parseJSONField(value: any, defaultValue: any = null): any {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Use raw SQL to avoid prepared statement cache issues
    const escapedId = escapeSQL(auth.restaurantId);
    const results = await prisma.$queryRawUnsafe(`
      SELECT * FROM restaurants WHERE id = '${escapedId}' LIMIT 1
    `) as any[];
    
    if (!results || results.length === 0) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    
    const doc = results[0];
    
    // Parse JSON fields
    const cuisineParsed = parseJSONField(doc.cuisine, []);
    const operatingHoursParsed = parseJSONField(doc.operatingHours, {});
    const featuresParsed = parseJSONField(doc.features, []);
    const paymentMethodsParsed = parseJSONField(doc.paymentMethods, ['cash']);
    
    const profile = {
      id: doc.id,
      name: doc.name,
      description: doc.description || '',
      address: doc.address || '',
      phone: doc.phone || '',
      website: doc.website || '',
      university: doc.university || '',
      cuisine: Array.isArray(cuisineParsed) ? cuisineParsed : [cuisineParsed].filter(Boolean),
      image: doc.image || '',
      logo: doc.logo || '',
      bannerImage: doc.bannerImage || '',
      rating: doc.rating || 0,
      reviewCount: doc.reviewCount || 0,
      isApproved: Boolean(doc.isApproved),
      isActive: doc.isActive !== false && doc.isActive !== 0,
      isOpen: Boolean(doc.isOpen),
      deliveryFee: doc.deliveryFee || 0,
      minimumOrder: doc.minimumOrder || 0,
      estimatedDeliveryTime: doc.estimatedDeliveryTime || 30,
      operatingHours: operatingHoursParsed,
      features: Array.isArray(featuresParsed) ? featuresParsed : [],
      paymentMethods: Array.isArray(paymentMethodsParsed) ? paymentMethodsParsed : ['cash'],
      location: parseJSONField(doc.location, null),
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    };
    
    return NextResponse.json({ profile });
  } catch (e: any) {
    console.error('Error fetching restaurant profile:', e);
    return NextResponse.json({ 
      message: 'Failed to load profile',
      error: process.env.NODE_ENV === 'development' ? e.message : undefined
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    const body = await request.json();
    
    console.log('📥 Profile update request:', { 
      restaurantId: auth.restaurantId, 
      fields: Object.keys(body)
    });
    
    // Build SET clause for SQL update
    const allowed = ['name', 'description', 'address', 'phone', 'website', 'university', 'cuisine', 'image', 'logo', 'bannerImage', 'operatingHours'];
    const setClauses: string[] = [];
    
    for (const key of allowed) {
      if (key in body && body[key] !== undefined) {
        let value = body[key];
        
        // Handle cuisine array - convert to JSON string
        if (key === 'cuisine' && Array.isArray(value)) {
          value = JSON.stringify(value);
        }
        
        // Handle operatingHours object - convert to JSON string
        if (key === 'operatingHours' && typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        // Handle empty strings for nullable fields
        if (value === '' && ['logo', 'bannerImage', 'website'].includes(key)) {
          setClauses.push(`\`${key}\` = NULL`);
        } else if (value === null) {
          setClauses.push(`\`${key}\` = NULL`);
        } else {
          setClauses.push(`\`${key}\` = '${escapeSQL(String(value))}'`);
        }
      }
    }
    
    if (setClauses.length === 0) {
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }
    
    // Add updatedAt
    setClauses.push(`\`updatedAt\` = NOW()`);
    
    const escapedId = escapeSQL(auth.restaurantId);
    const updateSQL = `UPDATE restaurants SET ${setClauses.join(', ')} WHERE id = '${escapedId}'`;
    
    console.log('📝 Executing SQL update...');
    
    // Execute update using raw SQL (bypasses prepared statement cache)
    await prisma.$executeRawUnsafe(updateSQL);
    
    console.log('✅ Update successful, fetching updated record...');
    
    // Fetch updated record
    const results = await prisma.$queryRawUnsafe(`
      SELECT * FROM restaurants WHERE id = '${escapedId}' LIMIT 1
    `) as any[];
    
    if (!results || results.length === 0) {
      return NextResponse.json({ message: 'Restaurant not found after update' }, { status: 404 });
    }
    
    const doc = results[0];
    
    // Parse JSON fields
    const cuisineParsed = parseJSONField(doc.cuisine, []);
    const operatingHoursParsed = parseJSONField(doc.operatingHours, {});
    const featuresParsed = parseJSONField(doc.features, []);
    const paymentMethodsParsed = parseJSONField(doc.paymentMethods, ['cash']);
    
    const profile = {
      id: doc.id,
      name: doc.name,
      description: doc.description || '',
      address: doc.address || '',
      phone: doc.phone || '',
      website: doc.website || '',
      university: doc.university || '',
      cuisine: Array.isArray(cuisineParsed) ? cuisineParsed : [cuisineParsed].filter(Boolean),
      image: doc.image || '',
      logo: doc.logo || '',
      bannerImage: doc.bannerImage || '',
      rating: doc.rating || 0,
      reviewCount: doc.reviewCount || 0,
      isApproved: Boolean(doc.isApproved),
      isActive: doc.isActive !== false && doc.isActive !== 0,
      isOpen: Boolean(doc.isOpen),
      deliveryFee: doc.deliveryFee || 0,
      minimumOrder: doc.minimumOrder || 0,
      estimatedDeliveryTime: doc.estimatedDeliveryTime || 30,
      operatingHours: operatingHoursParsed,
      features: Array.isArray(featuresParsed) ? featuresParsed : [],
      paymentMethods: Array.isArray(paymentMethodsParsed) ? paymentMethodsParsed : ['cash'],
      location: parseJSONField(doc.location, null),
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    };
    
    console.log('📤 Returning updated profile');
    
    return NextResponse.json({ profile });
  } catch (e: any) {
    console.error('Error updating restaurant profile:', e);
    console.error('Error details:', { message: e.message, code: e.code });
    return NextResponse.json({ 
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? e.message : undefined
    }, { status: 400 });
  }
}
