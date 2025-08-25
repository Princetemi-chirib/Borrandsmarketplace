import mongoose, { Schema, Document } from 'mongoose';

export interface IRider extends Document {
  userId: string;
  name: string;
  phone: string;
  email: string;
  university: string;
  vehicleType: string;
  vehicleNumber: string;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema({
  latitude: {
    type: Number,
    required: true,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: true,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  }
});

const riderSchema = new Schema<IRider>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Rider name is required'],
    trim: true,
    maxlength: [100, 'Rider name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['motorcycle', 'bicycle', 'car', 'scooter'],
    trim: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    maxlength: [20, 'Vehicle number cannot exceed 20 characters']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: locationSchema
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalDeliveries: {
    type: Number,
    default: 0,
    min: [0, 'Total deliveries cannot be negative']
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: [0, 'Total earnings cannot be negative']
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
riderSchema.virtual('averageRating').get(function() {
  return this.totalDeliveries > 0 ? this.rating / this.totalDeliveries : 0;
});

// Virtual for earnings per delivery
riderSchema.virtual('earningsPerDelivery').get(function() {
  return this.totalDeliveries > 0 ? this.totalEarnings / this.totalDeliveries : 0;
});

// Virtual for rider status
riderSchema.virtual('status').get(function() {
  if (!this.isApproved) return 'pending_approval';
  if (!this.isAvailable) return 'unavailable';
  return 'available';
});

// Method to update location
riderSchema.methods.updateLocation = function(latitude: number, longitude: number) {
  this.currentLocation = { latitude, longitude };
  return this.save();
};

// Method to update availability
riderSchema.methods.updateAvailability = function(isAvailable: boolean) {
  this.isAvailable = isAvailable;
  return this.save();
};

// Method to add delivery and earnings
riderSchema.methods.addDelivery = function(earnings: number, rating?: number) {
  this.totalDeliveries += 1;
  this.totalEarnings += earnings;
  if (rating) {
    this.rating += rating;
  }
  return this.save();
};

// Method to calculate distance to a point
riderSchema.methods.distanceTo = function(latitude: number, longitude: number) {
  if (!this.currentLocation) return null;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (latitude - this.currentLocation.latitude) * Math.PI / 180;
  const dLon = (longitude - this.currentLocation.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.currentLocation.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Index for better query performance
riderSchema.index({ university: 1, isApproved: 1, isAvailable: 1 });
riderSchema.index({ currentLocation: '2dsphere' });
riderSchema.index({ rating: -1 });
riderSchema.index({ totalDeliveries: -1 });
riderSchema.index({ vehicleType: 1 });

export default mongoose.models.Rider || mongoose.model<IRider>('Rider', riderSchema);
