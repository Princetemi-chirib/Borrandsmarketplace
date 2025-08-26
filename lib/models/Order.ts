import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  student: Types.ObjectId;
  restaurant: Types.ObjectId;
  rider?: Types.ObjectId;
  items: Array<{
    itemId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    total: number;
    specialInstructions?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'cash';
  deliveryAddress: string;
  deliveryInstructions?: string;
  estimatedDeliveryTime: number; // in minutes
  actualDeliveryTime?: Date;
  orderNumber: string;
  notes?: string;
  rating?: number;
  review?: string;
  ratedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema({
  itemId: {
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
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  specialInstructions: {
    type: String,
    maxlength: [200, 'Special instructions cannot exceed 200 characters']
  }
});

const orderSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  rider: {
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
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'],
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
    enum: ['card', 'cash'],
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true,
    trim: true
  },
  deliveryInstructions: {
    type: String,
    maxlength: [300, 'Delivery instructions cannot exceed 300 characters']
  },
  estimatedDeliveryTime: {
    type: Number,
    required: true,
    min: [5, 'Estimated delivery time must be at least 5 minutes']
  },
  actualDeliveryTime: {
    type: Date
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
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
  },
  ratedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
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
    timeline.push({ status: 'accepted', label: 'Order Confirmed', time: this.updatedAt });
  }

  if (['preparing', 'ready', 'picked_up', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'preparing', label: 'Preparing', time: this.updatedAt });
  }

  if (['ready', 'picked_up', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'ready', label: 'Ready for Pickup', time: this.updatedAt });
  }

  if (['picked_up', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'picked_up', label: 'Picked Up', time: this.updatedAt });
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
  if (newStatus === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  return this.save();
};

// Method to assign rider
orderSchema.methods.assignRider = function(riderId: string) {
  this.rider = riderId;
  return this.save();
};

// Method to rate order
orderSchema.methods.rateOrder = function(rating: number, review?: string) {
  this.rating = rating;
  this.review = review;
  this.ratedAt = new Date();
  return this.save();
};

// Index for better query performance
orderSchema.index({ student: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ rider: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderNumber: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);






