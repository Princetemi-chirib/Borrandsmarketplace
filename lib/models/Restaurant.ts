import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRestaurant extends Document {
  userId: Types.ObjectId;
  name: string;
  description: string;
  address: string;
  phone: string;
  website?: string;
  university: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  image: string;
  bannerImage?: string;
  isApproved: boolean;
  isActive: boolean;
  phoneVerified: boolean;
  whatsappVerified: boolean;
  operatingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  location: {
    type: string;
    coordinates: number[];
  };
  distance?: number;
  features: string[];
  paymentMethods: string[];
  categories: Types.ObjectId[];
  menu: Types.ObjectId[];
  stats: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const operatingHoursSchema = new Schema({
  open: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  close: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  isOpen: {
    type: Boolean,
    default: true
  }
});

const locationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function(coords: number[]) {
        return coords.length === 2 && 
               coords[0] >= -180 && coords[0] <= 180 && 
               coords[1] >= -90 && coords[1] <= 90;
      },
      message: 'Invalid coordinates'
    }
  }
});

const statsSchema = new Schema({
  totalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Total orders cannot be negative']
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: [0, 'Total revenue cannot be negative']
  },
  averageOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Average order value cannot be negative']
  },
  completionRate: {
    type: Number,
    default: 100,
    min: [0, 'Completion rate cannot be negative'],
    max: [100, 'Completion rate cannot exceed 100']
  }
});

const restaurantSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  whatsappVerified: {
    type: Boolean,
    default: false
  },
  website: {
    type: String,
    trim: true
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true
  },
  cuisine: [{
    type: String,
    required: [true, 'At least one cuisine type is required'],
    trim: true
  }],
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
  isOpen: {
    type: Boolean,
    default: true
  },
  deliveryFee: {
    type: Number,
    required: [true, 'Delivery fee is required'],
    min: [0, 'Delivery fee cannot be negative']
  },
  minimumOrder: {
    type: Number,
    required: [true, 'Minimum order amount is required'],
    min: [0, 'Minimum order cannot be negative']
  },
  estimatedDeliveryTime: {
    type: Number,
    required: [true, 'Estimated delivery time is required'],
    min: [5, 'Estimated delivery time must be at least 5 minutes'],
    max: [120, 'Estimated delivery time cannot exceed 120 minutes']
  },
  image: {
    type: String,
    default: '/images/default-restaurant.jpg'
  },
  bannerImage: {
    type: String
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  operatingHours: {
    monday: {
      type: operatingHoursSchema,
      default: () => ({ open: '08:00', close: '22:00', isOpen: true })
    },
    tuesday: {
      type: operatingHoursSchema,
      default: () => ({ open: '08:00', close: '22:00', isOpen: true })
    },
    wednesday: {
      type: operatingHoursSchema,
      default: () => ({ open: '08:00', close: '22:00', isOpen: true })
    },
    thursday: {
      type: operatingHoursSchema,
      default: () => ({ open: '08:00', close: '22:00', isOpen: true })
    },
    friday: {
      type: operatingHoursSchema,
      default: () => ({ open: '08:00', close: '22:00', isOpen: true })
    },
    saturday: {
      type: operatingHoursSchema,
      default: () => ({ open: '08:00', close: '22:00', isOpen: true })
    },
    sunday: {
      type: operatingHoursSchema,
      default: () => ({ open: '08:00', close: '22:00', isOpen: true })
    }
  },
  location: {
    type: locationSchema,
    required: true
  },
  distance: {
    type: Number,
    min: [0, 'Distance cannot be negative']
  },
  features: [{
    type: String,
    enum: ['free-delivery', 'fast-delivery', 'student-discount', 'halal', 'vegetarian-friendly', '24-7', 'breakfast', 'lunch', 'dinner', 'late-night']
  }],
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'mobile-money', 'bank-transfer']
  }],
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  menu: [{
    type: Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  stats: {
    type: statsSchema,
    default: () => ({})
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating calculation
restaurantSchema.virtual('averageRating').get(function() {
  return this.reviewCount > 0 ? this.rating / this.reviewCount : 0;
});

// Virtual for current operating status
restaurantSchema.virtual('isCurrentlyOpen').get(function() {
  if (!this.isOpen || !this.isActive) return false;
  
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = dayNames[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = (this.operatingHours as any)[dayOfWeek];
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
});

// Method to update rating
restaurantSchema.methods.updateRating = function(newRating: number) {
  this.rating += newRating;
  this.reviewCount += 1;
  return this.save();
};

// Method to update stats
restaurantSchema.methods.updateStats = function(orderTotal: number, isCompleted: boolean) {
  this.stats.totalOrders += 1;
  if (isCompleted) {
    this.stats.totalRevenue += orderTotal;
    this.stats.averageOrderValue = this.stats.totalRevenue / this.stats.totalOrders;
  }
  this.stats.completionRate = (this.stats.totalOrders / this.stats.totalOrders) * 100;
  return this.save();
};

// Method to check if restaurant is open
restaurantSchema.methods.checkIfOpen = function() {
  return this.isCurrentlyOpen;
};

// Index for better query performance
restaurantSchema.index({ university: 1, isApproved: 1, isOpen: 1, isActive: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ name: 'text', description: 'text' });
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ features: 1 });
restaurantSchema.index({ categories: 1 });

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', restaurantSchema);





