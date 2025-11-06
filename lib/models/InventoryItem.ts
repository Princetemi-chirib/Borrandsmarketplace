import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IInventoryItem extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  costPerUnit: number;
  lastRestocked?: Date;
  supplier?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  expiryDate?: Date;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  currentStock: { type: Number, required: true, min: 0, default: 0 },
  minStockLevel: { type: Number, required: true, min: 0, default: 0 },
  maxStockLevel: { type: Number, required: true, min: 0, default: 0 },
  unit: { type: String, required: true, trim: true },
  costPerUnit: { type: Number, required: true, min: 0 },
  lastRestocked: { type: Date },
  supplier: { type: String, trim: true },
  status: { type: String, enum: ['in_stock','low_stock','out_of_stock'], default: 'in_stock' },
  expiryDate: { type: Date },
  location: { type: String, trim: true },
}, { timestamps: true });

inventoryItemSchema.index({ restaurantId: 1, category: 1, name: 1 });

export default (mongoose.models.InventoryItem as Model<IInventoryItem>) || mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);













