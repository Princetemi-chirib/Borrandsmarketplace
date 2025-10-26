import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPack extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const packSchema = new Schema<IPack>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Pack name is required'],
    trim: true,
    maxlength: [100, 'Pack name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  price: {
    type: Number,
    required: [true, 'Pack price is required'],
    min: [0, 'Pack price cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: [0, 'Sort order cannot be negative']
  }
}, {
  timestamps: true
});

packSchema.index({ restaurantId: 1, isActive: 1 });
packSchema.index({ restaurantId: 1, sortOrder: 1 });

export default (mongoose.models.Pack as mongoose.Model<IPack>) || mongoose.model<IPack>('Pack', packSchema);


