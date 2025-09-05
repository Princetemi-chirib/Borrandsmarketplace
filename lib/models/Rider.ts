import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRider extends Document {
  userId: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car';
  vehicleNumber: string;
  vehicleModel?: string;
  vehicleColor?: string;
  licenseNumber?: string;
  insuranceNumber?: string;
  profileImage?: string;
  isOnline: boolean;
  isAvailable: boolean;
  isVerified: boolean;
  isActive: boolean;
  currentLocation: {
    type: string;
    coordinates: number[];
  };
  currentAddress?: string;
  rating: number;
  reviewCount: number;
  totalDeliveries: number;
  totalEarnings: number;
  averageDeliveryTime: number; // in minutes
  completionRate: number;
  workingHours: {
    startTime: string;
    endTime: string;
    days: string[];
  };
  documents: {
    license?: string;
    insurance?: string;
    vehicleRegistration?: string;
    idCard?: string;
  };
  stats: {
    todayDeliveries: number;
    todayEarnings: number;
    weeklyDeliveries: number;
    weeklyEarnings: number;
    monthlyDeliveries: number;
    monthlyEarnings: number;
  };
  preferences: {
    maxDistance: number; // in km
    preferredAreas: string[];
    workingDays: string[];
    minOrderAmount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

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

const workingHoursSchema = new Schema({
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  days: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }]
});

const documentsSchema = new Schema({
  license: {
    type: String
  },
  insurance: {
    type: String
  },
  vehicleRegistration: {
    type: String
  },
  idCard: {
    type: String
  }
});

const statsSchema = new Schema({
  todayDeliveries: {
    type: Number,
    default: 0,
    min: [0, 'Today deliveries cannot be negative']
  },
  todayEarnings: {
    type: Number,
    default: 0,
    min: [0, 'Today earnings cannot be negative']
  },
  weeklyDeliveries: {
    type: Number,
    default: 0,
    min: [0, 'Weekly deliveries cannot be negative']
  },
  weeklyEarnings: {
    type: Number,
    default: 0,
    min: [0, 'Weekly earnings cannot be negative']
  },
  monthlyDeliveries: {
    type: Number,
    default: 0,
    min: [0, 'Monthly deliveries cannot be negative']
  },
  monthlyEarnings: {
    type: Number,
    default: 0,
    min: [0, 'Monthly earnings cannot be negative']
  }
});

const preferencesSchema = new Schema({
  maxDistance: {
    type: Number,
    default: 10,
    min: [1, 'Max distance must be at least 1 km'],
    max: [50, 'Max distance cannot exceed 50 km']
  },
  preferredAreas: [{
    type: String,
    trim: true
  }],
  workingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  }
});

const riderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
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
  vehicleType: {
    type: String,
    enum: ['motorcycle', 'bicycle', 'car'],
    required: [true, 'Vehicle type is required']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true
  },
  vehicleModel: {
    type: String,
    trim: true
  },
  vehicleColor: {
    type: String,
    trim: true
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  insuranceNumber: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: locationSchema,
    required: true
  },
  currentAddress: {
    type: String,
    trim: true
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
  averageDeliveryTime: {
    type: Number,
    default: 30,
    min: [5, 'Average delivery time must be at least 5 minutes'],
    max: [120, 'Average delivery time cannot exceed 120 minutes']
  },
  completionRate: {
    type: Number,
    default: 100,
    min: [0, 'Completion rate cannot be negative'],
    max: [100, 'Completion rate cannot exceed 100']
  },
  workingHours: {
    type: workingHoursSchema,
    default: () => ({ startTime: '08:00', endTime: '22:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] })
  },
  documents: {
    type: documentsSchema,
    default: () => ({})
  },
  stats: {
    type: statsSchema,
    default: () => ({})
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating calculation
riderSchema.virtual('averageRating').get(function() {
  return this.reviewCount > 0 ? this.rating / this.reviewCount : 0;
});

// Virtual for current status
riderSchema.virtual('currentStatus').get(function() {
  if (!this.isActive) return 'inactive';
  if (!this.isOnline) return 'offline';
  if (!this.isAvailable) return 'busy';
  return 'available';
});

// Virtual for is currently working
riderSchema.virtual('isCurrentlyWorking').get(function() {
  if (!this.isOnline || !this.isAvailable) return false;
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDay = dayNames[now.getDay()] as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  
  return this.workingHours.days.includes(currentDay) && 
         currentTime >= this.workingHours.startTime && 
         currentTime <= this.workingHours.endTime;
});

// Method to update location
riderSchema.methods.updateLocation = function(lat: number, lng: number, address?: string) {
  this.currentLocation.coordinates = [lng, lat];
  if (address) {
    this.currentAddress = address;
  }
  return this.save();
};

// Method to update rating
riderSchema.methods.updateRating = function(newRating: number) {
  this.rating += newRating;
  this.reviewCount += 1;
  return this.save();
};

// Method to update delivery stats
riderSchema.methods.updateDeliveryStats = function(deliveryTime: number, earnings: number, isCompleted: boolean) {
  this.totalDeliveries += 1;
  if (isCompleted) {
    this.totalEarnings += earnings;
    this.averageDeliveryTime = ((this.averageDeliveryTime * (this.totalDeliveries - 1)) + deliveryTime) / this.totalDeliveries;
  }
  this.completionRate = (this.totalDeliveries / this.totalDeliveries) * 100;
  return this.save();
};

// Method to toggle online status
riderSchema.methods.toggleOnlineStatus = function() {
  this.isOnline = !this.isOnline;
  if (!this.isOnline) {
    this.isAvailable = false;
  }
  return this.save();
};

// Method to toggle availability
riderSchema.methods.toggleAvailability = function() {
  if (this.isOnline) {
    this.isAvailable = !this.isAvailable;
  }
  return this.save();
};

// Index for better query performance
riderSchema.index({ userId: 1 });
riderSchema.index({ isOnline: 1, isAvailable: 1, isActive: 1 });
riderSchema.index({ currentLocation: '2dsphere' });
riderSchema.index({ rating: -1 });
riderSchema.index({ totalDeliveries: -1 });
riderSchema.index({ vehicleType: 1 });
riderSchema.index({ isVerified: 1 });

export default mongoose.models.Rider || mongoose.model<IRider>('Rider', riderSchema);
