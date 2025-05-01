import { Schema, model, Document, Types } from "mongoose";

export type RewardType = "cash" | "points" | "discount";

export interface IAffiliateCode extends Document {
  code: string;
  owner: Types.ObjectId;
  createdAt: Date;
  expiresAt?: Date;
  usedBy: Types.ObjectId[];
  usageCount: number;
  maxUsage?: number;
  reward: number;
  rewardType: RewardType;
  isActive: boolean;
}

const affiliateCodeSchema = new Schema<IAffiliateCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    usageCount: {
      type: Number,
      default: 0,
    },
    maxUsage: {
      type: Number,
      default: null,
    },
    reward: {
      type: Number,
      default: 0,
    },
    rewardType: {
      type: String,
      enum: ["cash", "points", "discount"],
      default: "points",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IAffiliateCode>("AffiliateCode", affiliateCodeSchema);
