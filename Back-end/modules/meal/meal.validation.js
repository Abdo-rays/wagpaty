const Joi = require('joi');

const addMealSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'اسم الوجبة مطلوب',
    'string.min': 'اسم الوجبة قصير جدًا',
    'string.max': 'اسم الوجبة طويل جدًا',
  }),

  description: Joi.string().trim().max(500).optional().allow(''),

  price: Joi.number().min(0).required().messages({
    'number.base': 'السعر لازم يكون رقم',
    'number.min': 'السعر لازم يكون رقم موجب',
    'any.required': 'سعر الوجبة مطلوب',
  }),

  category: Joi.string().trim().required().messages({
    'string.empty': 'تصنيف الوجبة مطلوب',
  }),

  image: Joi.string().trim().optional().allow(''),

  isAvailable: Joi.boolean().optional(),

  discount: Joi.object({
    hasDiscount: Joi.boolean().optional(),
    percentage: Joi.number().min(0).max(100).optional(),
    expiresAt: Joi.date().optional().allow(null),
  }).optional(),
});

const updateMealSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),

  description: Joi.string().trim().max(500).optional().allow(''),

  price: Joi.number().min(0).optional(),

  category: Joi.string().trim().optional(),

  image: Joi.string().trim().optional().allow(''),

  isAvailable: Joi.boolean().optional(),

  discount: Joi.object({
    hasDiscount: Joi.boolean().optional(),
    percentage: Joi.number().min(0).max(100).optional(),
    expiresAt: Joi.date().optional().allow(null),
  }).optional(),
})
  .min(1)
  .messages({
    'object.min': 'لازم تبعت حقل واحد على الأقل عشان تعدله',
  });

module.exports = {
  addMealSchema,
  updateMealSchema,
};