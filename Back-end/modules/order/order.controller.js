const Order = require('../../models/Order');
const Meal = require('../../models/Meal');
const Restaurant = require('../../models/Restaurant');
const Notification = require('../../models/Notification');
const Message = require('../../models/Message');

const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');
const generateCode = require('../../utils/generateCode');
const { emitToUser, emitToConversation } = require('../../sockets/socket');


exports.createOrder = catchAsync(async (req, res, next) => {
  const { restaurant, items, notes, deliveryAddress, phone, paymentMethod } =
    req.body;
      const restaurantDoc = await Restaurant.findById(restaurant);
  if (!restaurantDoc) {
    return next(new ApiError('المطعم غير موجود', 404));
  }
  if (!restaurantDoc.isActive || !restaurantDoc.isApproved) {
    return next(
      new ApiError('هذا المطعم غير متاح لاستقبال الطلبات حاليًا', 400)
    );
  }
   const mealIds = items.map((item) => item.meal);
  const mealsFromDB = await Meal.find({ _id: { $in: mealIds } });

  if (mealsFromDB.length !== mealIds.length) {
    return next(new ApiError('واحدة أو أكثر من الوجبات غير موجودة', 404));
  }
   const notFromThisRestaurant = mealsFromDB.some(
    (meal) => meal.restaurant.toString() !== restaurant
  );
  if (notFromThisRestaurant) {
    return next(
      new ApiError('لا يمكنك طلب وجبات من مطاعم مختلفة في نفس الأوردر', 400)
    );
  }
  const unavailableMeal = mealsFromDB.find((meal) => !meal.isAvailable);
  if (unavailableMeal) {
    return next(
      new ApiError(`الوجبة "${unavailableMeal.name}" غير متاحة حاليًا`, 400)
    );
  }
  const orderItems = items.map((item) => {
    const mealDoc = mealsFromDB.find((m) => m._id.toString() === item.meal);

    let unitPrice = mealDoc.price;
    if (
      mealDoc.discount &&
      mealDoc.discount.hasDiscount &&
      mealDoc.discount.percentage > 0
    ) {
      const discountAmount = (mealDoc.price * mealDoc.discount.percentage) / 100;
      unitPrice = Math.round((mealDoc.price - discountAmount) * 100) / 100;
    }

    return {
      meal: mealDoc._id,
      name: mealDoc.name,
      price: unitPrice,
      quantity: item.quantity,
      subtotal: Math.round(unitPrice * item.quantity * 100) / 100,
    };
  });
 const totalPrice = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const order = await Order.create({
    code: generateCode('ORD'),
    customer: req.user._id,
    restaurant,
    items: orderItems,
    totalPrice: Math.round(totalPrice * 100) / 100,
    notes,
    deliveryAddress,
    phone,
    paymentMethod,
    status: 'pending',
  });
   await Promise.all(
    orderItems.map((item) =>
      Meal.findByIdAndUpdate(item.meal, {
        $inc: { orderCount: item.quantity },
      })
    )
  );
   await Notification.create({
    recipient: restaurant,
    recipientModel: 'Restaurant',
    type: 'newOrder',
    title: 'طلب جديد وصلك 🔔',
    message: `وصلك طلب جديد رقم ${order.code} بقيمة ${order.totalPrice} جنيه`,
    relatedOrder: order._id,
  });
   const systemMessage = await Message.create({
    customer: req.user._id,
    restaurant,
    order: order._id,
    sender: req.user._id,
    senderModel: 'User',
    receiver: restaurant,
    receiverModel: 'Restaurant',
    content: `📦 تم إنشاء طلب جديد رقم ${order.code} بقيمة ${order.totalPrice} جنيه`,
    messageType: 'system',
  });

  const io = req.app.get('io');
  if (io) {
    const conversationId = `${req.user._id}_${restaurant}`;
    emitToConversation(io, conversationId, 'newMessage', systemMessage);
  }

  res.status(201).json({
    status: 'success',
    message: 'تم إنشاء الأوردر بنجاح، في انتظار رد المطعم',
    data: order,
  });
});

/**
 * ==============================================
 * 2) قبول الأوردر (المطعم بس)
 * PATCH /api/orders/:id/accept
 * ==============================================
 */
exports.acceptOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    restaurant: req.user._id,
  });

  if (!order) {
    return next(new ApiError('الأوردر غير موجود أو لا يخصك', 404));
  }

  if (order.status !== 'pending') {
    return next(
      new ApiError('لا يمكن قبول هذا الأوردر، حالته الحالية غير مناسبة', 400)
    );
  }

  order.status = 'accepted';
  order.acceptedAt = Date.now();
  await order.save();

  await Notification.create({
    recipient: order.customer,
    recipientModel: 'User',
    type: 'orderAccepted',
    title: 'تم قبول طلبك ✅',
    message: `المطعم وافق على طلبك رقم ${order.code} وجاري تجهيزه الآن`,
    relatedOrder: order._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'تم قبول الأوردر بنجاح، تم فتح المحادثة مع العميل',
    data: order,
  });
});

exports.rejectOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    restaurant: req.user._id,
  });

  if (!order) {
    return next(new ApiError('الأوردر غير موجود أو لا يخصك', 404));
  }

  if (order.status !== 'pending') {
    return next(
      new ApiError('لا يمكن رفض هذا الأوردر، حالته الحالية غير مناسبة', 400)
    );
  }

  order.status = 'rejected';
  order.statusReason = reason;
  order.rejectedAt = Date.now();
  await order.save();

  await Notification.create({
    recipient: order.customer,
    recipientModel: 'User',
    type: 'orderRejected',
    title: 'تم رفض طلبك',
    message: `للأسف المطعم رفض طلبك رقم ${order.code}. السبب: ${reason}`,
    relatedOrder: order._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'تم رفض الأوردر',
    data: order,
  });
});

exports.markOrderOnTheWay = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    restaurant: req.user._id,
  });

  if (!order) {
    return next(new ApiError('الأوردر غير موجود أو لا يخصك', 404));
  }

  if (order.status !== 'accepted') {
    return next(
      new ApiError('لازم توافق على الأوردر الأول قبل تحديث حالته', 400)
    );
  }

  order.status = 'onTheWay';
  await order.save();

  await Notification.create({
    recipient: order.customer,
    recipientModel: 'User',
    type: 'orderOnTheWay',
    title: 'طلبك في الطريق 🚗',
    message: `طلبك رقم ${order.code} خرج للتوصيل، هيوصلك قريبًا`,
    relatedOrder: order._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'تم تحديث حالة الأوردر إلى "في الطريق"',
    data: order,
  });
});

exports.markOrderDelivered = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    restaurant: req.user._id,
  });

  if (!order) {
    return next(new ApiError('الأوردر غير موجود أو لا يخصك', 404));
  }

  if (order.status !== 'onTheWay' && order.status !== 'accepted') {
    return next(
      new ApiError('لا يمكن تسليم هذا الأوردر، حالته الحالية غير مناسبة', 400)
    );
  }

  order.status = 'delivered';
  order.deliveredAt = Date.now();
  await order.save();

  // نحدث إحصائيات المطعم (عدد الأوردرات والإيرادات)
  await Restaurant.findByIdAndUpdate(order.restaurant, {
    $inc: { totalOrders: 1, totalRevenue: order.totalPrice },
  });

  await Notification.create({
    recipient: order.customer,
    recipientModel: 'User',
    type: 'orderDelivered',
    title: 'تم تسليم طلبك 🎉',
    message: `تم تسليم طلبك رقم ${order.code} بنجاح، بالهناء والشفاء`,
    relatedOrder: order._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'تم تأكيد تسليم الأوردر بنجاح',
    data: order,
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    customer: req.user._id,
  });

  if (!order) {
    return next(new ApiError('الأوردر غير موجود أو لا يخصك', 404));
  }

  if (order.status !== 'pending') {
    return next(
      new ApiError(
        'لا يمكن إلغاء الأوردر بعد موافقة المطعم عليه، تواصل مع المطعم مباشرة',
        400
      )
    );
  }

  order.status = 'cancelled';
  order.statusReason = reason || 'تم الإلغاء من قِبل العميل';
  order.cancelledAt = Date.now();
  await order.save();

  await Notification.create({
    recipient: order.restaurant,
    recipientModel: 'Restaurant',
    type: 'orderCancelled',
    title: 'تم إلغاء طلب',
    message: `العميل ألغى الطلب رقم ${order.code}`,
    relatedOrder: order._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'تم إلغاء الأوردر بنجاح',
    data: order,
  });
});


exports.getMyOrders = catchAsync(async (req, res, next) => {
  const { status } = req.query;

  const filter = { customer: req.user._id };
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate('restaurant', 'restaurantName logo code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders,
  });
});

exports.getRestaurantOrders = catchAsync(async (req, res, next) => {
  const { status } = req.query;

  const filter = { restaurant: req.user._id };
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate('customer', 'name email phone code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders,
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone code')
    .populate('restaurant', 'restaurantName phone address code');

  if (!order) {
    return next(new ApiError('الأوردر غير موجود', 404));
  }

  const isOwner =
    order.customer._id.toString() === req.user._id.toString() ||
    order.restaurant._id.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== 'admin') {
    return next(new ApiError('غير مصرح لك بمشاهدة هذا الأوردر', 403));
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
});