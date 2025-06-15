import mongoose from "mongoose";
const Schema = mongoose.Schema;

const reelSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    title: {
      type: String,
    },
    name: {
      type: String,
    },
    colorCode: {
      type: String,
    },
    banner: {
      type: String,
    },
    ringtone: {
      type: String,
    },
    url: {
      type: String,
    },
    localPath: {
      type: String,
    },
    artist: {
      type: String,
    },
    artwork: {
      type: String,
    },
    playlists: [
      {
        type: String,
      },
    ],
    reelType: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
    },

    confessionVideoUrl: {
      type: String,
    },

    price: {
      type: Number,
      //   required: true,
    },

    duration: {
      type: Number,
      //   required: true,
    },

    stripePriceId: { type: String }, // Stripe Price ID

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reel", reelSchema);
