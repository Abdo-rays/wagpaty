const Joi = require('joi');

const createPostSchema = Joi.object({
  image: Joi.string().trim().optional().allow(''),
  caption: Joi.string().trim().max(1000).optional().allow(''),
})
  .custom((value, helpers) => {
    const hasImage = value.image && value.image.trim().length > 0;
    const hasCaption = value.caption && value.caption.trim().length > 0;

    if (!hasImage && !hasCaption) {
      return helpers.message('لازم تضيف صورة أو نص على الأقل للمنشور');
    }
    return value;
  });
const addCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(500).required().messages({
    'string.empty': 'محتوى التعليق مطلوب',
  }),
});

const banSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(300).required().messages({
    'string.empty': 'سبب الحظر مطلوب',
  }),
});

module.exports = { createPostSchema, addCommentSchema, banSchema };