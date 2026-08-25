const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'التقييم لازم يكون مرتبط بأوردر معين'],
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'التقييم مطلوب'],
      min: [1, 'أقل تقييم نجمة واحدة'],
      max: [5, 'أعلى تقييم 5 نجوم'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'التعليق طويل جدًا'],
    },
  },
  { timestamps: true }
);

reviewSchema.index({ restaurant: 1 });
reviewSchema.index({ customer: 1 });

module.exports = mongoose.model('Review', reviewSchema);