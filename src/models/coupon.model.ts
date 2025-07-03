import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  name?: string;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },

    name: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICoupon>("Coupon", CouponSchema);
