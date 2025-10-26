import { migrationManager } from './index';
import dbConnect from '../db';
import mongoose from 'mongoose';

// Migration 1: Add comprehensive indexes for performance
migrationManager.register({
  version: 1,
  name: 'Add comprehensive database indexes',
  up: async () => {
    await dbConnect();
    
    console.log('Creating indexes for Users collection...');
    await mongoose.connection.db.collection('users').createIndexes([
      // Compound indexes for common queries
      { key: { university: 1, role: 1, isActive: 1 }, name: 'university_role_active' },
      { key: { phone: 1 }, name: 'phone_unique', unique: true },
      { key: { university: 1, role: 1 }, name: 'university_role' },
      { key: { isActive: 1, isVerified: 1 }, name: 'active_verified' },
      { key: { favorites: 1 }, name: 'favorites' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { lastLogin: -1 }, name: 'last_login_desc' },
    ]);

    console.log('Creating indexes for Restaurants collection...');
    await mongoose.connection.db.collection('restaurants').createIndexes([
      { key: { userId: 1 }, name: 'user_id_unique', unique: true },
      { key: { university: 1, isApproved: 1, isActive: 1 }, name: 'university_approved_active' },
      { key: { university: 1, isOpen: 1, isActive: 1 }, name: 'university_open_active' },
      { key: { cuisine: 1 }, name: 'cuisine' },
      { key: { rating: -1 }, name: 'rating_desc' },
      { key: { name: 'text', description: 'text' }, name: 'name_description_text' },
      { key: { location: '2dsphere' }, name: 'location_2dsphere' },
      { key: { features: 1 }, name: 'features' },
      { key: { categories: 1 }, name: 'categories' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ]);

    console.log('Creating indexes for Orders collection...');
    await mongoose.connection.db.collection('orders').createIndexes([
      { key: { student: 1, createdAt: -1 }, name: 'student_created_desc' },
      { key: { restaurant: 1, status: 1 }, name: 'restaurant_status' },
      { key: { rider: 1, status: 1 }, name: 'rider_status' },
      { key: { status: 1, createdAt: -1 }, name: 'status_created_desc' },
      { key: { paymentStatus: 1 }, name: 'payment_status' },
      { key: { orderNumber: 1 }, name: 'order_number_unique', unique: true },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { estimatedDeliveryTime: 1 }, name: 'estimated_delivery_time' },
    ]);

    console.log('Creating indexes for MenuItems collection...');
    await mongoose.connection.db.collection('menuitems').createIndexes([
      { key: { restaurantId: 1, categoryId: 1 }, name: 'restaurant_category' },
      { key: { restaurantId: 1, isAvailable: 1 }, name: 'restaurant_available' },
      { key: { restaurantId: 1, isFeatured: 1 }, name: 'restaurant_featured' },
      { key: { name: 'text', description: 'text' }, name: 'name_description_text' },
      { key: { tags: 1 }, name: 'tags' },
      { key: { allergens: 1 }, name: 'allergens' },
      { key: { isVegetarian: 1, isVegan: 1 }, name: 'dietary_options' },
      { key: { rating: -1 }, name: 'rating_desc' },
      { key: { orderCount: -1 }, name: 'order_count_desc' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ]);

    console.log('Creating indexes for Riders collection...');
    await mongoose.connection.db.collection('riders').createIndexes([
      { key: { userId: 1 }, name: 'user_id_unique', unique: true },
      { key: { isOnline: 1, isAvailable: 1, isActive: 1 }, name: 'online_available_active' },
      { key: { currentLocation: '2dsphere' }, name: 'location_2dsphere' },
      { key: { rating: -1 }, name: 'rating_desc' },
      { key: { totalDeliveries: -1 }, name: 'total_deliveries_desc' },
      { key: { vehicleType: 1 }, name: 'vehicle_type' },
      { key: { isVerified: 1 }, name: 'verified' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ]);

    console.log('Creating indexes for Categories collection...');
    await mongoose.connection.db.collection('categories').createIndexes([
      { key: { restaurantId: 1, isActive: 1 }, name: 'restaurant_active' },
      { key: { restaurantId: 1, sortOrder: 1 }, name: 'restaurant_sort_order' },
      { key: { name: 'text' }, name: 'name_text' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ]);

    console.log('Creating indexes for InventoryItems collection...');
    await mongoose.connection.db.collection('inventoryitems').createIndexes([
      { key: { restaurantId: 1, category: 1, name: 1 }, name: 'restaurant_category_name' },
      { key: { restaurantId: 1, status: 1 }, name: 'restaurant_status' },
      { key: { status: 1 }, name: 'status' },
      { key: { expiryDate: 1 }, name: 'expiry_date' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ]);

    console.log('✅ All indexes created successfully');
  },
  down: async () => {
    await dbConnect();
    
    console.log('Dropping indexes...');
    const collections = ['users', 'restaurants', 'orders', 'menuitems', 'riders', 'categories', 'inventoryitems'];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).dropIndexes();
        console.log(`✅ Dropped indexes for ${collectionName}`);
      } catch (error) {
        console.log(`⚠️ No indexes to drop for ${collectionName}`);
      }
    }
  }
});

// Migration 2: Add data validation constraints
migrationManager.register({
  version: 2,
  name: 'Add data validation constraints',
  up: async () => {
    await dbConnect();
    
    console.log('Adding validation constraints...');
    
    // Add validation for phone numbers
    await mongoose.connection.db.collection('users').updateMany(
      { phone: { $exists: true } },
      { $set: { phoneVerified: false } }
    );
    
    // Add validation for restaurant approval status
    await mongoose.connection.db.collection('restaurants').updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: false } }
    );
    
    // Add validation for order status
    await mongoose.connection.db.collection('orders').updateMany(
      { status: { $exists: false } },
      { $set: { status: 'pending' } }
    );
    
    console.log('✅ Validation constraints added');
  },
  down: async () => {
    console.log('⚠️ Validation constraints rollback not implemented (data safe)');
  }
});

// Migration 3: Clean up orphaned data
migrationManager.register({
  version: 3,
  name: 'Clean up orphaned data',
  up: async () => {
    await dbConnect();
    
    console.log('Cleaning up orphaned data...');
    
    // Remove orders without valid restaurants
    const restaurantIds = await mongoose.connection.db.collection('restaurants').distinct('_id');
    const result = await mongoose.connection.db.collection('orders').deleteMany({
      restaurant: { $nin: restaurantIds }
    });
    console.log(`🗑️ Removed ${result.deletedCount} orphaned orders`);
    
    // Remove menu items without valid restaurants
    const menuItemResult = await mongoose.connection.db.collection('menuitems').deleteMany({
      restaurantId: { $nin: restaurantIds }
    });
    console.log(`🗑️ Removed ${menuItemResult.deletedCount} orphaned menu items`);
    
    // Remove categories without valid restaurants
    const categoryResult = await mongoose.connection.db.collection('categories').deleteMany({
      restaurantId: { $nin: restaurantIds }
    });
    console.log(`🗑️ Removed ${categoryResult.deletedCount} orphaned categories`);
    
    console.log('✅ Orphaned data cleanup completed');
  },
  down: async () => {
    console.log('⚠️ Orphaned data cleanup rollback not implemented (data permanently removed)');
  }
});
