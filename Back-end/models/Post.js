const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
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
    image: {
  type: String,
  default: null,
},

caption: {
  type: String,
  trim: true,
  maxlength: [1000, 'النص طويل جدًا'],
},
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

postSchema.pre('validate', function (next) {
  if (!this.image && !this.caption) {
    return next(new Error('لازم تضيف صورة أو نص على الأقل للمنشور'));
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);