const Joi = require('joi');

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'التقييم لازم يكون رقم',
    'number.min': 'أقل تقييم نجمة واحدة',
    'number.max': 'أعلى تقييم 5 نجوم',
    'any.required': 'التقييم مطلوب',
  }),
  comment: Joi.string().trim().max(500).optional().allow(''),
});

module.exports = { createReviewSchema };