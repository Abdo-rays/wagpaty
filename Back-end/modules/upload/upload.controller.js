const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');
const uploadToCloudinary = require('../../utils/cloudinaryUpload');

exports.uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError('من فضلك اختر صورة لرفعها', 400));
  }

  const allowedFolders = ['profiles', 'restaurants', 'meals', 'posts'];
  const folder = allowedFolders.includes(req.query.folder)
    ? `restaurant-app/${req.query.folder}`
    : 'restaurant-app/misc';

  let result;
  try {
    result = await uploadToCloudinary(req.file.buffer, folder);
  } catch (error) {
    const message = error?.message || error?.error?.message || 'تعذر الاتصال بخدمة رفع الصور';
    return next(new ApiError(`فشل رفع الصورة: ${message}`, 502));
  }

  res.status(200).json({
    status: 'success',
    message: 'تم رفع الصورة بنجاح',
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});