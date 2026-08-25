const Review = require('../../models/Review');
const Order = require('../../models/Order');
const Restaurant = require('../../models/Restaurant');

const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');

const recalculateRestaurantRating = async (restaurantId) => {
  const stats = await Review.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: '$restaurant',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  await Restaurant.findByIdAndUpdate(restaurantId, { rating: avgRating });
};

/**
 * 1) إضافة تقييم (العميل بس، وبس لو الأوردر delivered)
 * POST /api/reviews/:orderId
 */
exports.createReview = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { rating, comment } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    customer: req.user._id,
  });

  if (!order) {
    return next(new ApiError('الأوردر غير موجود أو لا يخصك', 404));
  }

  if (order.status !== 'delivered') {
    return next(
      new ApiError('لا يمكنك تقييم الطلب إلا بعد استلامه بنجاح', 400)
    );
  }

  const existingReview = await Review.findOne({ order: orderId });
  if (existingReview) {
    return next(new ApiError('لقد قمت بتقييم هذا الطلب من قبل', 400));
  }

  const review = await Review.create({
    order: orderId,
    customer: req.user._id,
    restaurant: order.restaurant,
    rating,
    comment,
  });

  await recalculateRestaurantRating(order.restaurant);

  res.status(201).json({
    status: 'success',
    message: 'تم إضافة تقييمك بنجاح، شكرًا لك',
    data: review,
  });
});

/**
 * 2) عرض كل تقييمات مطعم معين (عام)
 * GET /api/reviews/restaurant/:restaurantId
 */
exports.getRestaurantReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ restaurant: req.params.restaurantId })
    .populate('customer', 'name profileImage')
    .sort({ createdAt: -1 });

  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 0;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    avgRating,
    data: reviews,
  });
});

/**
 * 3) عرض تقييماتي أنا (العميل)
 * GET /api/reviews/my-reviews
 */
exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ customer: req.user._id })
    .populate('restaurant', 'restaurantName logo code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: reviews,
  });
});

/**
 * 4) هل الأوردر ده متاح للتقييم؟
 * GET /api/reviews/can-review/:orderId
 */
exports.canReviewOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    customer: req.user._id,
  });

  if (!order) {
    return next(new ApiError('الأوردر غير موجود أو لا يخصك', 404));
  }

  const existingReview = await Review.findOne({ order: req.params.orderId });
  const canReview = order.status === 'delivered' && !existingReview;

  res.status(200).json({
    status: 'success',
    data: {
      canReview,
      alreadyReviewed: !!existingReview,
      orderStatus: order.status,
    },
  });
});

/**
 * 5) حذف تقييم (العميل صاحبه بس)
 * DELETE /api/reviews/:id
 */
exports.deleteMyReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    _id: req.params.id,
    customer: req.user._id,
  });

  if (!review) {
    return next(new ApiError('التقييم غير موجود أو لا يخصك', 404));
  }

  const restaurantId = review.restaurant;
  await Review.findByIdAndDelete(req.params.id);
  await recalculateRestaurantRating(restaurantId);

  res.status(200).json({
    status: 'success',
    message: 'تم حذف تقييمك بنجاح',
  });
});

/**
 * 6) حذف أي تقييم (الأدمن)
 * DELETE /api/reviews/admin/:id
 */
exports.adminDeleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError('التقييم غير موجود', 404));
  }

  const restaurantId = review.restaurant;
  await Review.findByIdAndDelete(req.params.id);
  await recalculateRestaurantRating(restaurantId);

  res.status(200).json({
    status: 'success',
    message: 'تم حذف التقييم بنجاح من قِبل الإدارة',
  });
});