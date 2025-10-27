import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOption extends Document {
  name: string;
  price: number;
  itemId?: Types.ObjectId;
}

export interface IOptionGroup extends Document {
  restaurantId: Types.ObjectId;
  itemId: Types.ObjectId;
  name: string;
  minSelect: number;
  maxSelect: number;
  isActive: boolean;
  options: Array<IOption>;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema<IOption>({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  price: { type: Number, default: 0, min: [0, 'Price cannot be negative'] },
  itemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' }
});

const optionGroupSchema = new Schema<IOptionGroup>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  minSelect: { type: Number, default: 0, min: [0, 'minSelect cannot be negative'] },
  maxSelect: { type: Number, default: 1, min: [0, 'maxSelect cannot be negative'] },
  isActive: { type: Boolean, default: true },
  options: { type: [optionSchema], default: [] },
  sortOrder: { type: Number, default: 0, min: [0, 'Sort order cannot be negative'] }
}, {
  timestamps: true
});

// Indexes for better query performance
optionGroupSchema.index({ restaurantId: 1, itemId: 1, sortOrder: 1 });
optionGroupSchema.index({ itemId: 1, name: 1 });
optionGroupSchema.index({ restaurantId: 1, isActive: 1 });

export default (mongoose.models.OptionGroup as Model<IOptionGroup>) || mongoose.model<IOptionGroup>('OptionGroup', optionGroupSchema);


