const Joi = require('joi');

// =========================
// Customer Signup
// =========================
const customerSignupSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'الاسم مطلوب',
    'string.min': 'الاسم لازم يكون 3 حروف على الأقل',
    'string.max': 'الاسم أطول من اللازم',
    'any.required': 'الاسم مطلوب',
  }),

  email: Joi.string().email().required().messages({
    'string.empty': 'الإيميل مطلوب',
    'string.email': 'صيغة الإيميل غير صحيحة',
    'any.required': 'الإيميل مطلوب',
  }),

  password: Joi.string().min(8).required().messages({
    'string.empty': 'الباسورد مطلوب',
    'string.min': 'الباسورد لازم يكون 8 حروف على الأقل',
    'any.required': 'الباسورد مطلوب',
  }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'تأكيد الباسورد مش متطابق مع الباسورد',
      'string.empty': 'تأكيد الباسورد مطلوب',
      'any.required': 'تأكيد الباسورد مطلوب',
    }),

  phone: Joi.string().trim().optional().allow(''),

  address: Joi.string().trim().optional().allow(''),
});

// =========================
// Restaurant Signup
// =========================
const restaurantSignupSchema = Joi.object({
  ownerName: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'اسم صاحب المطعم مطلوب',
    'string.min': 'اسم صاحب المطعم لازم يكون 3 حروف على الأقل',
    'string.max': 'اسم صاحب المطعم أطول من اللازم',
    'any.required': 'اسم صاحب المطعم مطلوب',
  }),

  restaurantName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'اسم المطعم مطلوب',
    'string.min': 'اسم المطعم لازم يكون حرفين على الأقل',
    'string.max': 'اسم المطعم أطول من اللازم',
    'any.required': 'اسم المطعم مطلوب',
  }),

  email: Joi.string().email().required().messages({
    'string.empty': 'الإيميل مطلوب',
    'string.email': 'صيغة الإيميل غير صحيحة',
    'any.required': 'الإيميل مطلوب',
  }),

  password: Joi.string().min(8).required().messages({
    'string.empty': 'الباسورد مطلوب',
    'string.min': 'الباسورد لازم يكون 8 حروف على الأقل',
    'any.required': 'الباسورد مطلوب',
  }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'تأكيد الباسورد مش متطابق مع الباسورد',
      'string.empty': 'تأكيد الباسورد مطلوب',
      'any.required': 'تأكيد الباسورد مطلوب',
    }),

  phone: Joi.string().trim().required().messages({
    'string.empty': 'رقم الهاتف مطلوب',
    'any.required': 'رقم الهاتف مطلوب',
  }),

  address: Joi.string().trim().required().messages({
    'string.empty': 'عنوان المطعم مطلوب',
    'any.required': 'عنوان المطعم مطلوب',
  }),

  category: Joi.string().trim().optional().allow(''),

  description: Joi.string()
    .max(500)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'وصف المطعم لا يمكن أن يتجاوز 500 حرف',
    }),
});

// =========================
// Verify OTP
// =========================
const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'الإيميل مطلوب',
    'string.email': 'صيغة الإيميل غير صحيحة',
    'any.required': 'الإيميل مطلوب',
  }),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.empty': 'كود التفعيل مطلوب',
      'string.length': 'كود التفعيل لازم يكون 6 أرقام',
      'string.pattern.base': 'كود التفعيل لازم يكون أرقام بس',
      'any.required': 'كود التفعيل مطلوب',
    }),
});

// =========================
// Resend OTP
// =========================
const resendOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'الإيميل مطلوب',
    'string.email': 'صيغة الإيميل غير صحيحة',
    'any.required': 'الإيميل مطلوب',
  }),
});

// =========================
// Login
// =========================
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'الإيميل مطلوب',
    'string.email': 'صيغة الإيميل غير صحيحة',
    'any.required': 'الإيميل مطلوب',
  }),

  password: Joi.string().required().messages({
    'string.empty': 'الباسورد مطلوب',
    'any.required': 'الباسورد مطلوب',
  }),
});

// =========================
// Forget Password
// =========================
const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'الإيميل مطلوب',
    'string.email': 'صيغة الإيميل غير صحيحة',
    'any.required': 'الإيميل مطلوب',
  }),
});

// =========================
// Reset Password
// =========================
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'الإيميل مطلوب',
    'string.email': 'صيغة الإيميل غير صحيحة',
    'any.required': 'الإيميل مطلوب',
  }),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.empty': 'كود إعادة التعيين مطلوب',
      'string.length': 'الكود لازم يكون 6 أرقام',
      'string.pattern.base': 'كود إعادة التعيين لازم يكون أرقام بس',
      'any.required': 'كود إعادة التعيين مطلوب',
    }),

  newPassword: Joi.string().min(8).required().messages({
    'string.empty': 'الباسورد الجديد مطلوب',
    'string.min': 'الباسورد لازم يكون 8 حروف على الأقل',
    'any.required': 'الباسورد الجديد مطلوب',
  }),

  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'تأكيد الباسورد مش متطابق',
      'string.empty': 'تأكيد الباسورد مطلوب',
      'any.required': 'تأكيد الباسورد مطلوب',
    }),
});

// =========================
// Export
// =========================
module.exports = {
  customerSignupSchema,
  restaurantSignupSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
};
