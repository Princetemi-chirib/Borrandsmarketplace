import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  phone: string;
  password?: string;
  role: 'student' | 'restaurant' | 'rider' | 'admin';
  university: string;
  studentId?: string;
  department?: string;
  level?: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  phoneVerified: boolean;
  whatsappVerified: boolean;
  lastLogin?: Date;
  loginCount: number;
  otpCode?: string;
  otpExpiresAt?: Date;
  otpAttempts?: number;
  lastOtpSentAt?: Date;
  favorites: Types.ObjectId[];
  addresses: Array<{
    id: string;
    name: string;
    address: string;
    instructions?: string;
    isDefault: boolean;
  }>;
  preferences: {
    dietaryRestrictions: string[];
    allergens: string[];
    preferredCuisines: string[];
    notificationSettings: {
      whatsapp: boolean;
      sms: boolean;
      push: boolean;
      orderUpdates: boolean;
      promotions: boolean;
    };
  };
  wallet: {
    balance: number;
    currency: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  cleanupUnverifiedUsers(): Promise<any>;
}

const addressSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    maxlength: [300, 'Instructions cannot exceed 300 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const notificationSettingsSchema = new Schema({
  whatsapp: {
    type: Boolean,
    default: true
  },
  sms: {
    type: Boolean,
    default: true
  },
  push: {
    type: Boolean,
    default: true
  },
  orderUpdates: {
    type: Boolean,
    default: true
  },
  promotions: {
    type: Boolean,
    default: true
  }
});

const preferencesSchema = new Schema({
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal', 'kosher', 'none']
  }],
  allergens: [{
    type: String,
    enum: ['peanuts', 'tree-nuts', 'milk', 'eggs', 'soy', 'fish', 'shellfish', 'wheat']
  }],
  preferredCuisines: [{
    type: String
  }],
  notificationSettings: {
    type: notificationSettingsSchema,
    default: () => ({})
  }
});

const walletSchema = new Schema({
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD', 'EUR']
  }
});

const statsSchema = new Schema({
  totalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Total orders cannot be negative']
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: [0, 'Total spent cannot be negative']
  },
  averageOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Average order value cannot be negative']
  },
  lastOrderDate: {
    type: Date
  }
});

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  whatsappVerified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
    validate: {
      validator: function(value: string) {
        // If password is provided, it must be at least 6 characters
        return !value || value.length >= 6;
      },
      message: 'Password must be at least 6 characters'
    }
  },
  role: {
    type: String,
    enum: ['student', 'restaurant', 'rider', 'admin'],
    default: 'student',
    required: true
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true
  },
  studentId: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    enum: ['100', '200', '300', '400', '500', '600', 'Masters', 'PhD']
  },
  profileImage: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  phoneVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0,
    min: [0, 'Login count cannot be negative']
  },
  otpCode: {
    type: String,
    select: false
  },
  otpExpiresAt: {
    type: Date,
    select: false
  },
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lastOtpSentAt: {
    type: Date,
    select: false
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  addresses: [addressSchema],
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  },
  wallet: {
    type: walletSchema,
    default: () => ({})
  },
  stats: {
    type: statsSchema,
    default: () => ({})
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving (only if present)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.get('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    // @ts-ignore
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add favorite restaurant
userSchema.methods.addFavorite = function(restaurantId: string) {
  if (!this.favorites.includes(restaurantId)) {
    this.favorites.push(restaurantId);
  }
  return this.save();
};

// Method to remove favorite restaurant
userSchema.methods.removeFavorite = function(restaurantId: string) {
  this.favorites = this.favorites.filter((id: Types.ObjectId) => id.toString() !== restaurantId);
  return this.save();
};

// Method to add address
userSchema.methods.addAddress = function(address: any) {
  if (address.isDefault) {
    this.addresses.forEach((addr: any) => addr.isDefault = false);
  }
  this.addresses.push(address);
  return this.save();
};

// Method to update stats
userSchema.methods.updateStats = function(orderTotal: number) {
  this.stats.totalOrders += 1;
  this.stats.totalSpent += orderTotal;
  this.stats.averageOrderValue = this.stats.totalSpent / this.stats.totalOrders;
  this.stats.lastOrderDate = new Date();
  return this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.name.split(' ')[0];
});

// Index for better query performance
userSchema.index({ university: 1, role: 1 });
userSchema.index({ favorites: 1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Static method to clean up old unverified users
userSchema.statics.cleanupUnverifiedUsers = async function() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await this.deleteMany({
    isVerified: false,
    phoneVerified: false,
    whatsappVerified: false,
    createdAt: { $lt: twentyFourHoursAgo }
  });
  return result;
};

export default mongoose.models.User || mongoose.model<IUser, IUserModel>('User', userSchema);
