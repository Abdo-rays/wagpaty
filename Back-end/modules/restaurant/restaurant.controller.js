const Restaurant = require('../../models/Restaurant');
const Meal = require('../../models/Meal');
const Order = require('../../models/Order');

const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');


exports.getMyProfile = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: restaurant,
  });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'ownerName',
    'restaurantName',
    'phone',
    'address',
    'category',
    'description',
    'logo',
    'coverImage',
    'location',
  ];

  const restaurant = await Restaurant.findById(req.user._id);

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      restaurant[field] = req.body[field];
    }
  });

  await restaurant.save();

  res.status(200).json({
    status: 'success',
    message: 'تم تحديث بيانات المطعم بنجاح',
    data: restaurant,
  });
});

exports.changeMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const restaurant = await Restaurant.findById(req.user._id).select('+password');

  const isCorrect = await restaurant.comparePassword(currentPassword);
  if (!isCorrect) {
    return next(new ApiError('الباسورد الحالي غير صحيح', 401));
  }

  restaurant.password = newPassword;
  await restaurant.save();

  res.status(200).json({
    status: 'success',
    message: 'تم تغيير الباسورد بنجاح',
  });
});

exports.getMyOverview = catchAsync(async (req, res, next) => {
  const restaurantId = req.user._id;

  // 1) إحصائيات عامة
  const totalMeals = await Meal.countDocuments({ restaurant: restaurantId });
  const availableMeals = await Meal.countDocuments({
    restaurant: restaurantId,
    isAvailable: true,
  });
  const totalOrders = await Order.countDocuments({ restaurant: restaurantId });

  // 2) إحصائيات الأوردرات حسب الحالة
  const ordersByStatus = await Order.aggregate([
    { $match: { restaurant: restaurantId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const ordersStatusMap = ordersByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // 3) إجمالي الإيرادات (من الأوردرات المتسلمة بس)
  const revenueResult = await Order.aggregate([
    { $match: { restaurant: restaurantId, status: 'delivered' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  // 4) إيرادات آخر 7 أيام (لرسم بياني)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const revenueLast7Days = await Order.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        status: 'delivered',
        deliveredAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$deliveredAt' } },
        revenue: { $sum: '$totalPrice' },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 5) أفضل 5 وجبات مبيعًا
  const topMeals = await Meal.find({ restaurant: restaurantId })
    .sort({ orderCount: -1 })
    .limit(5)
    .select('name code price orderCount image');

  // 6) آخر 5 أوردرات
  const recentOrders = await Order.find({ restaurant: restaurantId })
    .populate('customer', 'name code phone')
    .sort({ createdAt: -1 })
    .limit(5);

  // 7) عدد الأوردرات المعلقة
  const pendingOrdersCount = ordersStatusMap.pending || 0;
  const weeklyOrders = revenueLast7Days.map((item) => ({
    day: item._id,
    orders: item.ordersCount,
    revenue: item.revenue,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      counts: {
        totalMeals,
        availableMeals,
        totalOrders,
        pendingOrdersCount,
      },
      ordersByStatus: {
        pending: ordersStatusMap.pending || 0,
        accepted: ordersStatusMap.accepted || 0,
        rejected: ordersStatusMap.rejected || 0,
        onTheWay: ordersStatusMap.onTheWay || 0,
        delivered: ordersStatusMap.delivered || 0,
        cancelled: ordersStatusMap.cancelled || 0,
      },
      totalRevenue,
      revenueLast7Days,
      topMeals,
      recentOrders,
      rating: req.user.rating,
      totalOrders,
      totalMeals,
      totalRevenue,
      weeklyOrders,
      monthRevenue: totalRevenue,
    },
  });
});