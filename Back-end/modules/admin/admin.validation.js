const Joi = require('joi');

const rejectRestaurantSchema = Joi.object({
  reason: Joi.string().trim().min(5).max(300).required().messages({
    'string.empty': 'سبب الرفض مطلوب',
    'string.min': 'سبب الرفض قصير جدًا',
  }),
});
const toggleStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'الحالة المطلوبة غير محددة',
  }),
});
const banSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(300).required().messages({
    'string.empty': 'سبب الحظر مطلوب',
    'string.min': 'سبب الحظر قصير جدًا',
  }),
});
module.exports = {
  rejectRestaurantSchema,
  toggleStatusSchema,
  banSchema,
};