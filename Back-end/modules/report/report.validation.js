const Joi = require('joi');

const createReportSchema = Joi.object({
  targetType: Joi.string().valid('restaurant', 'meal', 'post').required().messages({
    'any.only': 'نوع البلاغ يجب أن يكون مطعم أو وجبة أو منشور',
    'any.required': 'نوع المحتوى المُبلَّغ عنه مطلوب',
  }),
  targetId: Joi.string().required().messages({
    'string.empty': 'معرّف المحتوى المُبلَّغ عنه مطلوب',
  }),
  reason: Joi.string().trim().min(5).max(500).required().messages({
    'string.empty': 'سبب البلاغ مطلوب',
    'string.min': 'سبب البلاغ قصير جدًا، وضّح المشكلة أكتر',
  }),
});

const reviewReportSchema = Joi.object({
  status: Joi.string().valid('reviewed', 'dismissed').required().messages({
    'any.only': 'الحالة يجب أن تكون تمت المراجعة أو تم الرفض',
    'any.required': 'حالة البلاغ مطلوبة',
  }),
});

module.exports = { createReportSchema, reviewReportSchema };