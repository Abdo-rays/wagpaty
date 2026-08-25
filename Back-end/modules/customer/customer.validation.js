const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).optional(),
  phone: Joi.string().trim().optional().allow(''),
  address: Joi.string().trim().optional().allow(''),
  profileImage: Joi.string().trim().optional().allow(''),
})
  .min(1)
  .messages({
    'object.min': 'لازم تبعت حقل واحد على الأقل عشان تعدله',
  });

  const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'الباسورد الحالي مطلوب',
  }),

  newPassword: Joi.string().min(8).required().messages({
    'string.empty': 'الباسورد الجديد مطلوب',
    'string.min': 'الباسورد لازم يكون 8 حروف على الأقل',
  }),

  confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'تأكيد الباسورد مش متطابق',
  }),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
};