const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');
const Order = require('../../models/Order');

const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');


exports.getMyProfile = catchAsync(async (req, res, next) => {
  const customer = await User.findById(req.user._id);
  res.status(200).json({ status: 'success', data: customer });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'phone', 'address', 'profileImage'];
  const customer = await User.findById(req.user._id);

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      customer[field] = req.body[field];
    }
  });

  await customer.save();

  res.status(200).json({
    status: 'success',
    message: 'تم تحديث بياناتك بنجاح',
    data: customer,
  });
});

exports.changeMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const customer = await User.findById(req.user._id).select('+password');

  const isCorrect = await customer.comparePassword(currentPassword);
  if (!isCorrect) {
    return next(new ApiError('الباسورد الحالي غير صحيح', 401));
  }

  customer.password = newPassword;
  await customer.save();

  res.status(200).json({
    status: 'success',
    message: 'تم تغيير الباسورد بنجاح',
  });
});

exports.getMyOverview = catchAsync(async (req, res, next) => {
  const customerId = req.user._id;

  const totalOrders = await Order.countDocuments({ customer: customerId });
  const availableRestaurants = await Restaurant.countDocuments({ isActive: true, isApproved: true });

  const ordersByStatus = await Order.aggregate([
    { $match: { customer: customerId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const ordersStatusMap = ordersByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const spentResult = await Order.aggregate([
    { $match: { customer: customerId, status: 'delivered' } },
    { $group: { _id: null, totalSpent: { $sum: '$totalPrice' } } },
  ]);
  const totalSpent = spentResult.length > 0 ? spentResult[0].totalSpent : 0;

  const favoriteRestaurants = await Order.aggregate([
    { $match: { customer: customerId, status: 'delivered' } },
    { $group: { _id: '$restaurant', ordersCount: { $sum: 1 } } },
    { $sort: { ordersCount: -1 } },
    { $limit: 3 },
    {
      $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurantInfo',
      },
    },
    { $unwind: '$restaurantInfo' },
    {
      $project: {
        _id: 0,
        restaurantId: '$_id',
        restaurantName: '$restaurantInfo.restaurantName',
        logo: '$restaurantInfo.logo',
        ordersCount: 1,
      },
    },
  ]);

  const recentOrders = await Order.find({ customer: customerId })
    .populate('restaurant', 'restaurantName logo code')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    status: 'success',
    data: {
      totalOrders,
      availableRestaurants,
      ordersByStatus: {
        pending: ordersStatusMap.pending || 0,
        accepted: ordersStatusMap.accepted || 0,
        rejected: ordersStatusMap.rejected || 0,
        onTheWay: ordersStatusMap.onTheWay || 0,
        delivered: ordersStatusMap.delivered || 0,
        cancelled: ordersStatusMap.cancelled || 0,
      },
      totalSpent,
      favoriteRestaurants,
      recentOrders,
    },
  });
});

exports.getAvailableRestaurants = catchAsync(async (req, res, next) => {
  const { search, category } = req.query;

  const filter = { isActive: true, isApproved: true };

  if (search) {
    filter.restaurantName = { $regex: search, $options: 'i' };
  }
  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }

  const restaurants = await Restaurant.find(filter)
    .select('restaurantName logo coverImage description category address rating code')
    .sort({ rating: -1 });

  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: restaurants,
  });
});

exports.getPublicStats = catchAsync(async (req, res, next) => {
  const [customers, restaurants, completedOrders] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Restaurant.countDocuments(),
    Order.countDocuments({ status: 'delivered' }),
  ]);

  res.status(200).json({
    status: 'success',
    data: { customers, restaurants, completedOrders },
  });
});

exports.getRestaurantDetails = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findOne({
    _id: req.params.id,
    isActive: true,
    isApproved: true,
  }).select('restaurantName logo coverImage description category address phone rating code');

  if (!restaurant) {
    return next(new ApiError('المطعم غير موجود أو غير متاح حاليًا', 404));
  }

  res.status(200).json({
    status: 'success',
    data: restaurant,
  });
});