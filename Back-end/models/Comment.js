const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'authorModel',
    },
    authorModel: {
      type: String,
      required: true,
      enum: ['User', 'Restaurant'],
    },
    content: {
      type: String,
      required: [true, 'محتوى التعليق مطلوب'],
      trim: true,
      maxlength: [500, 'التعليق طويل جدًا'],
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);