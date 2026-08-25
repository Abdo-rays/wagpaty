const Joi = require('joi');

const createOrderSchema = Joi.object({
  restaurant: Joi.string().required().messages({
    'string.empty': 'المطعم مطلوب',
    'any.required': 'المطعم مطلوب',
  }),

  items: Joi.array()
    .items(
      Joi.object({
        meal: Joi.string().required().messages({
          'string.empty': 'معرّف الوجبة مطلوب',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'number.min': 'الكمية لازم تكون واحد على الأقل',
          'any.required': 'الكمية مطلوبة',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'لازم تختار وجبة واحدة على الأقل',
      'any.required': 'الوجبات المطلوبة مطلوبة',
    }),

  notes: Joi.string().trim().max(300).optional().allow(''),

  deliveryAddress: Joi.string().trim().required().messages({
    'string.empty': 'عنوان التوصيل مطلوب',
  }),

  phone: Joi.string().trim().required().messages({
    'string.empty': 'رقم التواصل مطلوب',
  }),

  paymentMethod: Joi.string().valid('cash', 'card').optional(),
});


const rejectOrderSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(300).required().messages({
    'string.empty': 'سبب الرفض مطلوب',
    'string.min': 'سبب الرفض قصير جدًا',
  }),
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().trim().max(300).optional().allow(''),
});

module.exports = {
  createOrderSchema,
  rejectOrderSchema,
  cancelOrderSchema,
};