import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMenuItem extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  stock: number;
  lowStockThreshold: number;
  preparationTime: number;
  allergens: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
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
  }
});

const menuItemSchema = new Schema<IMenuItem>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
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
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: [
      'appetizers',
      'main_course',
      'desserts',
      'beverages',
      'sides',
      'breakfast',
      'lunch',
      'dinner',
      'snacks',
      'drinks'
    ]
  },
  image: {
    type: String,
    default: '/images/default-menu-item.jpg'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: [0, 'Low stock threshold cannot be negative']
  },
  preparationTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [60, 'Preparation time cannot exceed 60 minutes']
  },
  allergens: [{
    type: String,
    enum: [
      'dairy',
      'eggs',
      'fish',
      'shellfish',
      'tree_nuts',
      'peanuts',
      'wheat',
      'soy',
      'gluten',
      'none'
    ]
  }],
  nutritionalInfo: {
    type: nutritionalInfoSchema,
    default: () => ({})
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for stock status
menuItemSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Virtual for isAvailable based on stock
menuItemSchema.virtual('isActuallyAvailable').get(function() {
  return this.isAvailable && this.stock > 0;
});

// Method to update stock
menuItemSchema.methods.updateStock = function(quantity: number) {
  this.stock = Math.max(0, this.stock - quantity);
  if (this.stock === 0) {
    this.isAvailable = false;
  }
  return this.save();
};

// Method to add stock
menuItemSchema.methods.addStock = function(quantity: number) {
  this.stock += quantity;
  if (this.stock > 0 && !this.isAvailable) {
    this.isAvailable = true;
  }
  return this.save();
};

// Index for better query performance
menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
menuItemSchema.index({ restaurantId: 1, stock: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1 });

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', menuItemSchema);


