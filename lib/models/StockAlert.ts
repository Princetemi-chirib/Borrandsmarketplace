import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IStockAlert extends Document {
  restaurantId: Types.ObjectId;
  itemId: Types.ObjectId;
  itemName: string;
  currentStock: number;
  minLevel: number;
  priority: 'high' | 'medium' | 'low';
  daysUntilOut?: number;
  createdAt: Date;
  resolvedAt?: Date;
}

const stockAlertSchema = new Schema<IStockAlert>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  itemName: { type: String, required: true },
  currentStock: { type: Number, required: true },
  minLevel: { type: Number, required: true },
  priority: { type: String, enum: ['high','medium','low'], required: true },
  daysUntilOut: { type: Number },
  resolvedAt: { type: Date },
}, { timestamps: { createdAt: true, updatedAt: false } });

stockAlertSchema.index({ restaurantId: 1, createdAt: -1 });

export default (mongoose.models.StockAlert as Model<IStockAlert>) || mongoose.model<IStockAlert>('StockAlert', stockAlertSchema);















