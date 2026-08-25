const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const restaurantSchema = new mongoose.Schema({

    code:{
        type:String,
        unique:true,
        required:true,
    },
     ownerName: {
      type: String,
      required: [true, 'اسم صاحب المطعم مطلوب'],
      trim: true,
    },
     restaurantName: {
      type: String,
      required: [true, 'اسم المطعم مطلوب'],
      trim: true,
      minlength: [2, 'اسم المطعم قصير جدًا'],
      maxlength: [100, 'اسم المطعم طويل جدًا'],
    },
     email: {
      type: String,
      required: [true, 'الإيميل مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
    },
     password: {
      type: String,
      required: [true, 'الباسورد مطلوب'],
      minlength: [8, 'الباسورد لازم يكون 8 حروف على الأقل'],
      select: false,
    },
     phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'عنوان المطعم مطلوب'],
      trim: true,
    },
     location: {
      lat: { type: Number },
      lng: { type: Number },
     },
      logo: {
      type: String,
      default: null,
    },
     coverImage: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'الوصف طويل جدًا'],
    },
 category: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      default: 'restaurant',
      immutable: true, 
    },

     isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
        isBanned: {
          type: Boolean,
          default: false,
        },
        banReason: {
          type: String,
          trim: true,
          maxlength: 300,
        },
    },
    otpExpires: {
      type: Date,
      select: false,
    },
     resetPasswordOTP: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
     isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
  type: Boolean,
  default: false,
},
banReason: {
  type: String,
  trim: true,
},
     isApproved: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: {
      type: Date,
    },
     totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
},
 {
    timestamps: true,
  }
)


restaurantSchema.pre('save',async function(next){
     if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

restaurantSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});


restaurantSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

restaurantSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model('Restaurant', restaurantSchema);