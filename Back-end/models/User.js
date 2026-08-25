const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    code:{
        type: String,
        unique: true,
        required: true,
    },
    name:{
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
      minlength: [3, 'الاسم لازم يكون 3 حروف على الأقل'],
      maxlength: [50, 'الاسم أطول من اللازم'],
    },
    email:{
      type: String,
      required: [true, 'الإيميل مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password:{
      type: String,
      required: [true, 'الباسورد مطلوب'],
      minlength: [8, 'الباسورد لازم يكون 8 حروف على الأقل'],
    },
     confirmPassword: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 40,
    },
    phone:{
        type:String,
        trim:true,
    },
     address: {
      type: String,
      trim: true,
    },
          isBanned: {
            type: Boolean,
            default: false,
          },
          banReason: {
            type: String,
            trim: true,
            maxlength: 300,
          },

    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },

    profileImage: {
      type: String,
      default: null,
    },
     isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
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
     passwordChangedAt: {
      type: Date,
    },

},
 {timestamps: true,}
);


userSchema.pre('save',async function (next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);