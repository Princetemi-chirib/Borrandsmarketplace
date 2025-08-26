import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: [0, 'Sort order cannot be negative']
  },
  itemCount: {
    type: Number,
    default: 0,
    min: [0, 'Item count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Method to increment item count
categorySchema.methods.incrementItemCount = function() {
  this.itemCount += 1;
  return this.save();
};

// Method to decrement item count
categorySchema.methods.decrementItemCount = function() {
  this.itemCount = Math.max(0, this.itemCount - 1);
  return this.save();
};

// Method to update item count
categorySchema.methods.updateItemCount = function(count: number) {
  this.itemCount = Math.max(0, count);
  return this.save();
};

// Index for better query performance
categorySchema.index({ restaurantId: 1, isActive: 1 });
categorySchema.index({ restaurantId: 1, sortOrder: 1 });
categorySchema.index({ name: 'text' });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
