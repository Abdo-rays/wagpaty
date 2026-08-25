const Restaurant = require('../../models/Restaurant');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');
const Meal = require('../../models/Meal');
const Order = require('../../models/Order');



exports.getOverview = catchAsync(async (req, res, next) => {
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalRestaurants = await Restaurant.countDocuments();
  const approvedRestaurants = await Restaurant.countDocuments({ isApproved: true });
  const pendingRestaurants = await Restaurant.countDocuments({
    isApproved: false,
    isVerified: true,
  });
  const totalMeals = await Meal.countDocuments();
  const totalOrders = await Order.countDocuments();


  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const ordersStatusMap = ordersByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});


  const revenueResult = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;


  const topRestaurants = await Order.aggregate([
    { $match: { status: 'delivered' } },
    {
      $group: {
        _id: '$restaurant',
        ordersCount: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
    { $sort: { ordersCount: -1 } },
    { $limit: 5 },
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
        code: '$restaurantInfo.code',
        ordersCount: 1,
        revenue: 1,
      },
    },
  ]);

 
  const recentOrders = await Order.find()
    .populate('customer', 'name code')
    .populate('restaurant', 'restaurantName code')
    .sort({ createdAt: -1 })
    .limit(5);
  const lastRestaurants = await Restaurant.find().sort({ createdAt: -1 }).limit(5).select('restaurantName code logo isApproved isActive');
  const lastCustomers = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).select('name code profileImage isActive');

  res.status(200).json({
    status: 'success',
    data: {
      counts: {
        totalCustomers,
        totalRestaurants,
        approvedRestaurants,
        pendingRestaurants,
        totalMeals,
        totalOrders,
      },
      ordersByStatus: Object.entries(ordersStatusMap).map(([name, value]) => ({ name, value })),
      totalRevenue,
      topRestaurants,
      recentOrders,
      totalCustomers,
      totalRestaurants,
      totalOrders,
      pendingApprovals: pendingRestaurants,
      lastRestaurants,
      lastCustomers,
    },
  });
});
exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const { status, search } = req.query;

  const filter = {};

  if (status === 'pending') {
    filter.isApproved = false;
    filter.isVerified = true;
  } else if (status === 'approved') {
    filter.isApproved = true;
  }

  if (search) {
    filter.$or = [
      { restaurantName: { $regex: search, $options: 'i' } },
      { ownerName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const restaurants = await Restaurant.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: restaurants,
  });
});

exports.getRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ApiError('المطعم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: restaurant,
  });
});

exports.approveRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ApiError('المطعم غير موجود', 404));
  }

  if (!restaurant.isVerified) {
    return next(
      new ApiError('المطعم لسه معملش تفعيل لإيميله، متقدرش توافق عليه دلوقتي', 400)
    );
  }

  if (restaurant.isApproved) {
    return next(new ApiError('المطعم موافق عليه بالفعل', 400));
  }

  restaurant.isApproved = true;
  await restaurant.save({ validateBeforeSave: false });

  await Notification.create({
    recipient: restaurant._id,
    recipientModel: 'Restaurant',
    type: 'restaurantApproved',
    title: 'تم قبول مطعمك 🎉',
    message: 'تمت الموافقة على حسابك من الإدارة، يمكنك الآن تسجيل الدخول والبدء في إضافة الوجبات',
  });

  res.status(200).json({
    status: 'success',
    message: 'تمت الموافقة على المطعم بنجاح',
    data: restaurant,
  });
});

exports.rejectRestaurant = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ApiError('المطعم غير موجود', 404));
  }

  if (restaurant.isApproved) {
    return next(
      new ApiError('المطعم موافق عليه بالفعل، متقدرش ترفضه دلوقتي', 400)
    );
  }

  restaurant.isActive = false;
  await restaurant.save({ validateBeforeSave: false });

  await Notification.create({
    recipient: restaurant._id,
    recipientModel: 'Restaurant',
    type: 'general',
    title: 'تم رفض طلب انضمام مطعمك',
    message: `للأسف تم رفض حسابك من الإدارة. السبب: ${reason}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'تم رفض المطعم بنجاح',
  });
});


exports.toggleRestaurantStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;

  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ApiError('المطعم غير موجود', 404));
  }

  restaurant.isActive = isActive;
  await restaurant.save({ validateBeforeSave: false });

  await Notification.create({
    recipient: restaurant._id,
    recipientModel: 'Restaurant',
    type: 'general',
    title: isActive ? 'تم تفعيل حسابك' : 'تم إيقاف حسابك',
    message: isActive
      ? 'تم تفعيل حساب مطعمك مرة أخرى من الإدارة'
      : 'تم إيقاف حساب مطعمك من قِبل الإدارة، تواصل معنا لمزيد من التفاصيل',
  });

  res.status(200).json({
    status: 'success',
    message: `تم ${isActive ? 'تفعيل' : 'إيقاف'} المطعم بنجاح`,
    data: restaurant,
  });
});


exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ApiError('المطعم غير موجود', 404));
  }

  await Restaurant.findByIdAndDelete(req.params.id);


  await Restaurant.findByIdAndDelete(req.params.id);  // 1) نحذف المطعم نفسه

  await Meal.deleteMany({ restaurant: req.params.id }); // 2) نحذف كل وجباته

  await Order.deleteMany({ restaurant: req.params.id }); // 3) نحذف كل أوردراته


  res.status(200).json({
    status: 'success',
    message: 'تم حذف المطعم بنجاح',
  });
});

exports.getAllCustomers = catchAsync(async (req, res, next) => {
  const { search } = req.query;

  const filter = { role: 'customer' };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const customers = await User.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: customers.length,
    data: customers,
  });
});

exports.getCustomer = catchAsync(async (req, res, next) => {
  const customer = await User.findOne({
    _id: req.params.id,
    role: 'customer',
  });

  if (!customer) {
    return next(new ApiError('العميل غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: customer,
  });
});
exports.toggleCustomerStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;

  const customer = await User.findOne({
    _id: req.params.id,
    role: 'customer',
  });

  if (!customer) {
    return next(new ApiError('العميل غير موجود', 404));
  }

  customer.isActive = isActive;
  await customer.save({ validateBeforeSave: false });

  await Notification.create({
    recipient: customer._id,
    recipientModel: 'User',
    type: 'general',
    title: isActive ? 'تم تفعيل حسابك' : 'تم إيقاف حسابك',
    message: isActive
      ? 'تم تفعيل حسابك مرة أخرى من الإدارة'
      : 'تم إيقاف حسابك من قِبل الإدارة، تواصل معنا لمزيد من التفاصيل',
  });

  res.status(200).json({
    status: 'success',
    message: `تم ${isActive ? 'تفعيل' : 'إيقاف'} العميل بنجاح`,
    data: customer,
  });
});
exports.deleteCustomer = catchAsync(async (req, res, next) => {
  const customer = await User.findOne({
    _id: req.params.id,
    role: 'customer',
  });

  if (!customer) {
    return next(new ApiError('العميل غير موجود', 404));
  }

  await User.findByIdAndDelete(req.params.id);

  await Order.deleteMany({ customer: req.params.id }); // 2) نحذف كل أوردراته


  res.status(200).json({
    status: 'success',
    message: 'تم حذف العميل بنجاح',
  });
});

exports.getAllMeals = catchAsync(async (req, res, next) => {
  const { restaurant, search } = req.query;

  const filter = {};

  if (restaurant) {
    filter.restaurant = restaurant;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const meals = await Meal.find(filter)
    .populate('restaurant', 'restaurantName code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: meals.length,
    data: meals,
  });
});

exports.deleteMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) {
    return next(new ApiError('الوجبة غير موجودة', 404));
  }

  await Meal.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'تم حذف الوجبة بنجاح من قِبل الإدارة',
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { status, restaurant, customer } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (restaurant) filter.restaurant = restaurant;
  if (customer) filter.customer = customer;

  const orders = await Order.find(filter)
    .populate('customer', 'name email code')
    .populate('restaurant', 'restaurantName code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders,
  });
});
exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone code')
    .populate('restaurant', 'restaurantName phone address code');

  if (!order) {
    return next(new ApiError('الأوردر غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
});
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError('الأوردر غير موجود', 404));
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'تم حذف الأوردر بنجاح من قِبل الإدارة',
  });
});
exports.banRestaurant = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    return next(new ApiError('المطعم غير موجود', 404));
  }

  restaurant.isBanned = true;
  restaurant.banReason = reason;
  await restaurant.save({ validateBeforeSave: false });

  await Notification.create({
    recipient: restaurant._id,
    recipientModel: 'Restaurant',
    type: 'general',
    title: 'تم حظرك من الكوميونيتي',
    message: `تم حظر حسابك من التفاعل في الكوميونيتي. السبب: ${reason}`,
  });

  res.status(200).json({ status: 'success', message: 'تم حظر المطعم من الكوميونيتي بنجاح' });
});

exports.unbanRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    return next(new ApiError('المطعم غير موجود', 404));
  }

  restaurant.isBanned = false;
  restaurant.banReason = undefined;
  await restaurant.save({ validateBeforeSave: false });

  res.status(200).json({ status: 'success', message: 'تم رفع الحظر عن المطعم بنجاح' });
});

exports.banCustomer = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!customer) {
    return next(new ApiError('العميل غير موجود', 404));
  }

  customer.isBanned = true;
  customer.banReason = reason;
  await customer.save({ validateBeforeSave: false });

  await Notification.create({
    recipient: customer._id,
    recipientModel: 'User',
    type: 'general',
    title: 'تم حظرك من الكوميونيتي',
    message: `تم حظر حسابك من التفاعل في الكوميونيتي. السبب: ${reason}`,
  });

  res.status(200).json({ status: 'success', message: 'تم حظر العميل من الكوميونيتي بنجاح' });
});

exports.unbanCustomer = catchAsync(async (req, res, next) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!customer) {
    return next(new ApiError('العميل غير موجود', 404));
  }

  customer.isBanned = false;
  customer.banReason = undefined;
  await customer.save({ validateBeforeSave: false });

  res.status(200).json({ status: 'success', message: 'تم رفع الحظر عن العميل بنجاح' });
});