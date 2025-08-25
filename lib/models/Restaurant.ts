import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  userId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  university: string;
  cuisine: string[];
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  image: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>({
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
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
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
  totalRatings: {
    type: Number,
    default: 0,
    min: [0, 'Total ratings cannot be negative']
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
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating calculation
restaurantSchema.virtual('averageRating').get(function() {
  return this.totalRatings > 0 ? this.rating / this.totalRatings : 0;
});

// Index for better query performance
restaurantSchema.index({ university: 1, isApproved: 1, isOpen: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
