import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    contributor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],

    prompt: {
      type: String,
    },

    files: [{ type: String }],

    price: {
      type: Number,
    },

    about: {
      type: String,
    },

    category: {
      type: String,
    },

    explainMembership: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
