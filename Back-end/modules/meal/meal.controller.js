const Meal = require('../../models/Meal');

const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');
const generateCode = require('../../utils/generateCode');

exports.addMeal = catchAsync(async (req, res, next) => {
  const { name, description, price, category, image, isAvailable, discount } =
    req.body;

  const meal = await Meal.create({
    code: generateCode('MEL'),
    restaurant: req.user._id,
    name,
    description,
    price,
    category,
    image,
    isAvailable,
    discount,
  });

  res.status(201).json({
    status: 'success',
    message: 'تم إضافة الوجبة بنجاح',
    data: meal,
  });
});


exports.getMyMeals = catchAsync(async (req, res, next) => {
  const meals = await Meal.find({ restaurant: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: 'success',
    results: meals.length,
    data: meals,
  });
});


exports.getMyMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findOne({
    _id: req.params.id,
    restaurant: req.user._id,
  });

  if (!meal) {
    return next(new ApiError('الوجبة غير موجودة أو لا تخصك', 404));
  }

  res.status(200).json({
    status: 'success',
    data: meal,
  });
});

exports.updateMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findOne({
    _id: req.params.id,
    restaurant: req.user._id,
  });

  if (!meal) {
    return next(new ApiError('الوجبة غير موجودة أو لا تخصك', 404));
  }

  const allowedFields = [
    'name',
    'description',
    'price',
    'category',
    'image',
    'isAvailable',
    'discount',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      meal[field] = req.body[field];
    }
  });

  await meal.save();

  res.status(200).json({
    status: 'success',
    message: 'تم تعديل الوجبة بنجاح',
    data: meal,
  });
});

exports.deleteMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findOne({
    _id: req.params.id,
    restaurant: req.user._id,
  });

  if (!meal) {
    return next(new ApiError('الوجبة غير موجودة أو لا تخصك', 404));
  }

  await Meal.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'تم حذف الوجبة بنجاح',
  });
});
exports.getRestaurantMeals = catchAsync(async (req, res, next) => {
  const meals = await Meal.find({
    restaurant: req.params.restaurantId,
    isAvailable: true,
  }).sort({ category: 1, createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: meals.length,
    data: meals,
  });
});


exports.getMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findById(req.params.id).populate(
    'restaurant',
    'restaurantName logo address rating'
  );

  if (!meal) {
    return next(new ApiError('الوجبة غير موجودة', 404));
  }

  res.status(200).json({
    status: 'success',
    data: meal,
  });
});