const Joi = require('joi');

const sendMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    'string.empty': 'محتوى الرسالة مطلوب',
    'string.max': 'الرسالة طويلة جدًا',
  }),
});

module.exports = { sendMessageSchema };