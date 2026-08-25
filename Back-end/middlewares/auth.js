const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ApiError('من فضلك سجل دخول للوصول لهذه الصفحة', 401)
    );
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

 
  let account;
  if (decoded.role === 'restaurant') {
    account = await Restaurant.findById(decoded.id);
  } else {
    // customer أو admin
    account = await User.findById(decoded.id);
  }

  if (!account) {
    return next(
      new ApiError('الحساب بتاع التوكن ده مش موجود، سجل دخول تاني', 401)
    );
  }
  
  if (!account.isActive) {
    return next(
      new ApiError('حسابك موقوف حاليًا، تواصل مع الإدارة', 403)
    );
  }

  if (
    account.changedPasswordAfter &&
    account.changedPasswordAfter(decoded.iat)
  ) {
    return next(
      new ApiError('تم تغيير الباسورد مؤخرًا، من فضلك سجل دخول تاني', 401)
    );
  }


  req.user = account;
  req.user.role = decoded.role; 
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('ليس لديك الصلاحية للقيام بهذا الإجراء', 403)
      );
    }
    next();
  };
};