const mongoose = require('mongoose')

const mealSchema= new mongoose.Schema({
    code: {
      type: String,
      unique: true,
      required: true,
    },
     restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'الوجبة لازم تكون تابعة لمطعم'],
    },
    name: {
      type: String,
      required: [true, 'اسم الوجبة مطلوب'],
      trim: true,
      minlength: [2, 'اسم الوجبة قصير جدًا'],
      maxlength: [100, 'اسم الوجبة طويل جدًا'],
    },
     description: {
      type: String,
      trim: true,
      maxlength: [500, 'الوصف طويل جدًا'],
    },
     image: {
      type: String,
      default: null,
    },
     price: {
      type: Number,
      required: [true, 'سعر الوجبة مطلوب'],
      min: [0, 'السعر لازم يكون رقم موجب'],
    },
    category: {
      type: String,
      trim: true,
      required: [true, 'تصنيف الوجبة مطلوب'],
    },
     discount: {
      hasDiscount: {
        type: Boolean,
        default: false,
      },
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
       expiresAt: {
        type: Date,
        default: null,
      },
    },
     isAvailable: {
      type: Boolean,
      default: true,
    },
    orderCount: {
      type: Number,
      default: 0, 
    },

},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

mealSchema.virtual('finalprice').get(function(){
    if (this.discount && this.discount.hasDiscount&&this.discount.percentage>0){
 const discountAmount = (this.price * this.discount.percentage) / 100;
    return Math.round((this.price - discountAmount) * 100) / 100;
  }
  return this.price;
});


mealSchema.index({ restaurant: 1 });

module.exports = mongoose.model('Meal', mealSchema);
