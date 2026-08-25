const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
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

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel',
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['User', 'Restaurant'],
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel',
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ['User', 'Restaurant'],
    },

    content: {
      type: String,
      required: [true, 'محتوى الرسالة مطلوب'],
      trim: true,
      maxlength: [1000, 'الرسالة طويلة جدًا'],
    },

    messageType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ customer: 1, restaurant: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);