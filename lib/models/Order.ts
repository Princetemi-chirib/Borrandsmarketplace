import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  studentId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  riderId?: Types.ObjectId;
  items: Array<{
    menuItemId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'paystack' | 'cash';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    instructions?: string;
  };
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema({
  menuItemId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  specialInstructions: {
    type: String,
    maxlength: [200, 'Special instructions cannot exceed 200 characters']
  }
});

const deliveryAddressSchema = new Schema({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
    trim: true
  },
  instructions: {
    type: String,
    maxlength: [300, 'Delivery instructions cannot exceed 300 characters']
  }
});

const orderSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  riderId: {
    type: Schema.Types.ObjectId,
    ref: 'Rider'
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: [0, 'Delivery fee cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'cash'],
    required: true
  },
  deliveryAddress: {
    type: deliveryAddressSchema,
    required: true
  },
  estimatedDeliveryTime: {
    type: Date,
    required: true
  },
  actualDeliveryTime: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order status timeline
orderSchema.virtual('statusTimeline').get(function() {
  const timeline = [
    { status: 'pending', label: 'Order Placed', time: this.createdAt }
  ];

  if (this.status !== 'pending') {
    timeline.push({ status: 'confirmed', label: 'Order Confirmed', time: this.updatedAt });
  }

  if (['preparing', 'ready', 'picked_up', 'in_transit', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'preparing', label: 'Preparing', time: this.updatedAt });
  }

  if (['ready', 'picked_up', 'in_transit', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'ready', label: 'Ready for Pickup', time: this.updatedAt });
  }

  if (['picked_up', 'in_transit', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'picked_up', label: 'Picked Up', time: this.updatedAt });
  }

  if (['in_transit', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'in_transit', label: 'In Transit', time: this.updatedAt });
  }

  if (this.status === 'delivered') {
    timeline.push({ status: 'delivered', label: 'Delivered', time: this.actualDeliveryTime || this.updatedAt });
  }

  return timeline;
});

// Virtual for delivery time calculation
orderSchema.virtual('deliveryTime').get(function() {
  if (this.actualDeliveryTime && this.createdAt) {
    return Math.round((this.actualDeliveryTime.getTime() - this.createdAt.getTime()) / (1000 * 60));
  }
  return null;
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus: string) {
  this.status = newStatus;
  if (newStatus === 'delivered' && !this.actualDeliveryTime) {
    this.actualDeliveryTime = new Date();
  }
  return this.save();
};

// Method to assign rider
orderSchema.methods.assignRider = function(riderId: string) {
  this.riderId = riderId;
  return this.save();
};

// Index for better query performance
orderSchema.index({ studentId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ riderId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ estimatedDeliveryTime: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);


