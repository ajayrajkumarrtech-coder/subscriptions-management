import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

export const Plan = mongoose.model('Plan', planSchema);
