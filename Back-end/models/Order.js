const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({

     code: {
      type: String,
      unique: true,
      required: true,
    },
     customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'الأوردر لازم يكون تابع لعميل'],
    },
     restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'الأوردر لازم يكون تابع لمطعم'],
    },
     items: [
      {
        meal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Meal',
          required: true,
        },
         name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'الكمية لازم تكون واحد على الأقل'],
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
     totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
     notes: {
      type: String,
      trim: true,
      maxlength: [300, 'الملاحظات طويلة جدًا'],
    },
      deliveryAddress: {
      type: String,
      required: [true, 'عنوان التوصيل مطلوب'],
      trim: true,
    },
     phone: {
      type: String,
      required: [true, 'رقم التواصل مطلوب'],
      trim: true,
    },
     status: {
      type: String,
      enum: [
        'pending', 
        'accepted', 
        'rejected', 
        'onTheWay', 
        'delivered', 
        'cancelled', 
      ],
      default: 'pending',
    },
     statusReason: {
      type: String,
      trim: true,
    },
     paymentMethod: {
      type: String,
      enum: ['cash', 'card'],
      default: 'cash',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ customer: 1 });
orderSchema.index({ restaurant: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
