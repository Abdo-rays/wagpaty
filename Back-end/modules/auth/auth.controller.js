const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');
const generateOTP =require('../../utils/generateOTP');
const generateCode =require('../../utils/generateCode');
const generateToken =require('../../utils/generateToken');
const sendEmail =require('../../utils/sendEmail');
const {
  otpEmailTemplate,
  resetPasswordEmailTemplate,
} = require('../../utils/emailTemplates');


const getOtpExpiry = (minutes) =>{
    return new Date(Date.now() + minutes * 60 * 1000)
}


exports.signupCustomer = catchAsync(async (req,res,next) =>{
    const {name , email, password , confirmPassword , phone , address} = req.body;

    if (!password || !confirmPassword) {
      return next(new ApiError('الباسورد وتأكيد الباسورد مطلوبين', 400));
    }

    if (password !== confirmPassword) {
      return next(new ApiError('الباسورد وتأكيد الباسورد مش متطابقين', 400));
    }

    const existingUser = await User.findOne({email})
    const existingRestaurant = await Restaurant.findOne({email})
    
     if (existingUser || existingRestaurant) {
    return next(new ApiError('الإيميل ده مسجل بالفعل', 400));
  }
 const otp = generateOTP();
  const code = generateCode('CUS');

  const user = await  User.create({
    code,
    name,
    email,
    password,
    phone,
    address,
    role: 'customer',
    otp,
    otpExpires: getOtpExpiry (process.env.OTP_EXPIRES_IN_MINUTES),
  })

  try {
    await sendEmail({
      to: user.email,
      subject: 'كود تفعيل حسابك - Restaurant App',
      html: otpEmailTemplate(user.name, otp),
    });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    return next(
      new ApiError('حصل خطأ أثناء إرسال إيميل التفعيل، حاول تاني', 500)
    );
  }

  res.status(201).json({
    status: 'success',
    message: 'تم إنشاء الحساب بنجاح، من فضلك تحقق من إيميلك لتفعيل الحساب',
    data: {
      email: user.email,
      code: user.code,
    },
  });
});
    
exports.signupRestaurant = catchAsync(async (req, res, next) => {
  const {
    ownerName,
    restaurantName,
    email,
    password,
    confirmPassword,
    phone,
    address,
    category,
    description,
  } = req.body;

  if (!password || !confirmPassword) {
    return next(new ApiError('الباسورد وتأكيد الباسورد مطلوبين', 400));
  }

  if (password !== confirmPassword) {
    return next(new ApiError('الباسورد وتأكيد الباسورد مش متطابقين', 400));
  }

  const existingUser = await User.findOne({ email });
  const existingRestaurant = await Restaurant.findOne({ email });

  if (existingUser || existingRestaurant) {
    return next(new ApiError('الإيميل ده مسجل بالفعل', 400));
  }

  const otp = generateOTP();
  const code = generateCode('RST');

  const restaurant = await Restaurant.create({
    code,
    ownerName,
    restaurantName,
    email,
    password,
    phone,
    address,
    category,
    description,
    otp,
    otpExpires: getOtpExpiry(process.env.OTP_EXPIRES_IN_MINUTES),
  });

  try {
    await sendEmail({
      to: restaurant.email,
      subject: 'كود تفعيل حساب مطعمك - Restaurant App',
      html: otpEmailTemplate(restaurant.ownerName, otp),
    });
  } catch (err) {
    await Restaurant.findByIdAndDelete(restaurant._id);
    return next(
      new ApiError('حصل خطأ أثناء إرسال إيميل التفعيل، حاول تاني', 500)
    );
  }

  res.status(201).json({
    status: 'success',
    message:
      'تم إنشاء حساب المطعم بنجاح، من فضلك تحقق من إيميلك لتفعيل الحساب. بعد التفعيل، حسابك هيكون تحت مراجعة الإدارة',
    data: {
      email: restaurant.email,
      code: restaurant.code,
    },
  });
});


exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  let account = await User.findOne({ email }).select('+otp +otpExpires');
  let accountType = 'customer';
  let Model = User;

  if (!account) {
    account = await Restaurant.findOne({ email }).select('+otp +otpExpires');
    accountType = 'restaurant';
    Model = Restaurant;
  }

  if (!account) {
    return next(new ApiError('لا يوجد حساب مسجل بهذا الإيميل', 404));
  }

  if (account.isVerified) {
    return next(new ApiError('الحساب مفعل بالفعل', 400));
  }

  if (!account.otp || account.otp !== otp) {
    return next(new ApiError('كود التفعيل غير صحيح', 400));
  }

  if (account.otpExpires < Date.now()) {
    return next(
      new ApiError('انتهت صلاحية كود التفعيل، من فضلك اطلب كود جديد', 400)
    );
  }

  account.isVerified = true;
  account.otp = undefined;
  account.otpExpires = undefined;
  await account.save({ validateBeforeSave: false });

  if (accountType === 'customer') {
    const token = generateToken({ id: account._id, role: account.role });
    return res.status(200).json({
      status: 'success',
      message: 'تم تفعيل حسابك بنجاح',
      token,
      data: {
        id: account._id,
        code: account.code,
        name: account.name,
        email: account.email,
        role: account.role,
      },
    });
  }

  return res.status(200).json({
    status: 'success',
    message:
      'تم تفعيل إيميلك بنجاح. حسابك دلوقتي تحت مراجعة الإدارة، هيتم إعلامك بمجرد الموافقة',
    data: {
      id: account._id,
      code: account.code,
      email: account.email,
    },
  });
});


exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  let account = await User.findOne({ email });
  let accountName = account ? account.name : null;

  if (!account) {
    account = await Restaurant.findOne({ email });
    accountName = account ? account.ownerName : null;
  }

  if (!account) {
    return next(new ApiError('لا يوجد حساب مسجل بهذا الإيميل', 404));
  }

  if (account.isVerified) {
    return next(new ApiError('الحساب مفعل بالفعل', 400));
  }

  const otp = generateOTP();
  account.otp = otp;
  account.otpExpires = getOtpExpiry(process.env.OTP_EXPIRES_IN_MINUTES);
  await account.save({ validateBeforeSave: false });

  await sendEmail({
    to: account.email,
    subject: 'كود تفعيل حسابك - Restaurant App',
    html: otpEmailTemplate(accountName, otp),
  });

  res.status(200).json({
    status: 'success',
    message: 'تم إرسال كود تفعيل جديد إلى إيميلك',
  });
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  let account = await User.findOne({ email }).select('+password');
  let accountType = account ? account.role : null;

  if (!account) {
    account = await Restaurant.findOne({ email }).select('+password');
    accountType = 'restaurant';
  }

  if (!account) {
    return next(new ApiError('الإيميل أو الباسورد غير صحيح', 401));
  }

  const isPasswordCorrect = await account.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new ApiError('الإيميل أو الباسورد غير صحيح', 401));
  }

  if (!account.isVerified) {
    return next(
      new ApiError('من فضلك فعّل حسابك بالإيميل الأول قبل تسجيل الدخول', 403)
    );
  }

  if (!account.isActive) {
    return next(
      new ApiError('حسابك موقوف حاليًا، تواصل مع الإدارة لمزيد من التفاصيل', 403)
    );
  }

  if (accountType === 'restaurant' && !account.isApproved) {
    return next(
      new ApiError('حسابك لسه تحت مراجعة الإدارة، هيتم إعلامك بمجرد الموافقة', 403)
    );
  }

  const token = generateToken({ id: account._id, role: accountType });

  const userData = {
    id: account._id,
    code: account.code,
    email: account.email,
    role: accountType,
  };

  if (accountType === 'restaurant') {
    userData.restaurantName = account.restaurantName;
    userData.ownerName = account.ownerName;
  } else {
    userData.name = account.name;
  }

  res.status(200).json({
    status: 'success',
    message: 'تم تسجيل الدخول بنجاح',
    token,
    data: userData,
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  let account = await User.findOne({ email });
  let accountName = account ? account.name : null;

  if (!account) {
    account = await Restaurant.findOne({ email });
    accountName = account ? account.ownerName : null;
  }

  if (!account) {
    return next(new ApiError('لا يوجد حساب مسجل بهذا الإيميل', 404));
  }

  const otp = generateOTP();
  account.resetPasswordOTP = otp;
  account.resetPasswordExpires = getOtpExpiry(
    process.env.RESET_PASSWORD_EXPIRES_IN_MINUTES
  );
  await account.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: account.email,
      subject: 'كود إعادة تعيين الباسورد - Restaurant App',
      html: resetPasswordEmailTemplate(accountName, otp),
    });
  } catch (err) {
    account.resetPasswordOTP = undefined;
    account.resetPasswordExpires = undefined;
    await account.save({ validateBeforeSave: false });

    return next(
      new ApiError('حصل خطأ أثناء إرسال إيميل إعادة التعيين، حاول تاني', 500)
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'تم إرسال كود إعادة تعيين الباسورد إلى إيميلك',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword, confirmNewPassword } = req.body;

  if (!newPassword || !confirmNewPassword) {
    return next(new ApiError('الباسورد الجديد وتأكيده مطلوبين', 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(new ApiError('الباسورد الجديد وتأكيده مش متطابقين', 400));
  }

  let account = await User.findOne({ email }).select(
    '+resetPasswordOTP +resetPasswordExpires'
  );

  if (!account) {
    account = await Restaurant.findOne({ email }).select(
      '+resetPasswordOTP +resetPasswordExpires'
    );
  }

  if (!account) {
    return next(new ApiError('لا يوجد حساب مسجل بهذا الإيميل', 404));
  }

  if (!account.resetPasswordOTP || account.resetPasswordOTP !== otp) {
    return next(new ApiError('كود إعادة التعيين غير صحيح', 400));
  }

  if (account.resetPasswordExpires < Date.now()) {
    return next(
      new ApiError('انتهت صلاحية الكود، من فضلك اطلب كود جديد', 400)
    );
  }

  account.password = newPassword;
  account.resetPasswordOTP = undefined;
  account.resetPasswordExpires = undefined;
  await account.save();

  res.status(200).json({
    status: 'success',
    message: 'تم تغيير الباسورد بنجاح، يمكنك تسجيل الدخول الآن',
  });
});