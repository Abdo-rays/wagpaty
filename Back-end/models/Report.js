const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'المُبلِّغ مطلوب'],
      refPath: 'reporterModel',
    },
    reporterModel: {
      type: String,
      enum: ['User', 'Restaurant'],
      required: true,
    },
    targetType: {
      type: String,
      enum: ['restaurant', 'meal', 'post'],
      required: [true, 'نوع المحتوى المُبلَّغ عنه مطلوب'],
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel',
    },
    targetModel: {
      type: String,
      required: true,
      enum: ['Restaurant', 'Meal', 'Post'],
    },
    reason: {
      type: String,
      required: [true, 'سبب البلاغ مطلوب'],
      trim: true,
      maxlength: [500, 'سبب البلاغ طويل جدًا'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

reportSchema.index({ targetType: 1, status: 1 });
reportSchema.index({ target: 1 });

module.exports = mongoose.model('Report', reportSchema);