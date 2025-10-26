import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMenuItem extends Document {
  restaurantId: Types.ObjectId;
  categoryId: Types.ObjectId;
  packId?: Types.ObjectId;
  name: string;
  description: string;
  priceDescription?: string;
  price: number;
  originalPrice?: number;
  image: string;
  isAvailable: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  allergens: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  preparationTime: number; // in minutes
  ingredients: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  orderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const nutritionalInfoSchema = new Schema({
  calories: {
    type: Number,
    default: 0,
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    default: 0,
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    default: 0,
    min: [0, 'Carbs cannot be negative']
  },
  fat: {
    type: Number,
    default: 0,
    min: [0, 'Fat cannot be negative']
  },
  fiber: {
    type: Number,
    default: 0,
    min: [0, 'Fiber cannot be negative']
  }
});

const menuItemSchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  packId: {
    type: Schema.Types.ObjectId,
    ref: 'Pack',
    required: false
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  priceDescription: {
    type: String,
    trim: true,
    maxlength: [100, 'Price description cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  allergens: [{
    type: String,
    enum: ['peanuts', 'tree-nuts', 'milk', 'eggs', 'soy', 'fish', 'shellfish', 'wheat', 'gluten']
  }],
  nutritionalInfo: {
    type: nutritionalInfoSchema,
    default: () => ({})
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [120, 'Preparation time cannot exceed 120 minutes']
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  sortOrder: {
    type: Number,
    default: 0,
    min: [0, 'Sort order cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  orderCount: {
    type: Number,
    default: 0,
    min: [0, 'Order count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating calculation
menuItemSchema.virtual('averageRating').get(function() {
  return this.reviewCount > 0 ? this.rating / this.reviewCount : 0;
});

// Virtual for discount percentage
menuItemSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for is on sale
menuItemSchema.virtual('isOnSale').get(function() {
  return this.originalPrice && this.originalPrice > this.price;
});

// Method to update rating
menuItemSchema.methods.updateRating = function(newRating: number) {
  this.rating += newRating;
  this.reviewCount += 1;
  return this.save();
};

// Method to increment order count
menuItemSchema.methods.incrementOrderCount = function() {
  this.orderCount += 1;
  return this.save();
};

// Method to toggle availability
menuItemSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

// Index for better query performance
menuItemSchema.index({ restaurantId: 1, categoryId: 1 });
menuItemSchema.index({ restaurantId: 1, categoryId: 1, sortOrder: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
menuItemSchema.index({ restaurantId: 1, isFeatured: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ tags: 1 });
menuItemSchema.index({ allergens: 1 });
menuItemSchema.index({ isVegetarian: 1, isVegan: 1 });
menuItemSchema.index({ rating: -1 });
menuItemSchema.index({ orderCount: -1 });

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', menuItemSchema);


