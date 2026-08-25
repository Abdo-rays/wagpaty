const ApiError = require('../utils/apiError')


module.exports = (req, res, next) => {
  next(new ApiError(`الرابط ${req.originalUrl} غير موجود على السيرفر`, 404));
};