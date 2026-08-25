const ApiError = require('../utils/apiError')


const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {

        abortEarly: false,
        stripUnknown: true,
});
if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      return next(new ApiError(messages, 400));
    }

    next();
  };
};

module.exports = validate;