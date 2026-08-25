const Message = require('../../models/Message');
const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');
const Notification = require('../../models/Notification');

const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');
const { emitToUser, emitToConversation } = require('../../sockets/socket');

const validateRestaurantAccess = async (restaurantId) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isActive: true,
    isApproved: true,
  });

  if (!restaurant) {
    throw new ApiError('المطعم غير موجود أو غير متاح حاليًا', 404);
  }

  return restaurant;
};

/**
 * 1) عرض محادثة معينة
 * GET /api/chat/:partnerId
 */
exports.getConversation = catchAsync(async (req, res, next) => {
  const { partnerId } = req.params;
  const isCustomer = req.user.role === 'customer';

  const customerId = isCustomer ? req.user._id : partnerId;
  const restaurantId = isCustomer ? partnerId : req.user._id;

  if (isCustomer) {
    await validateRestaurantAccess(restaurantId);
  }

  const messages = await Message.find({
    customer: customerId,
    restaurant: restaurantId,
  }).sort({ createdAt: 1 });

  const readResult = await Message.updateMany(
    {
      customer: customerId,
      restaurant: restaurantId,
      receiver: req.user._id,
      isRead: false,
    },
    { isRead: true }
  );

  if (readResult.modifiedCount > 0) {
    const io = req.app.get('io');
    if (io) {
      emitToConversation(io, `${customerId}_${restaurantId}`, 'messagesRead', {
        readerId: req.user._id.toString(),
      });
    }
  }

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: messages,
  });
});

/**
 * 2) إرسال رسالة
 * POST /api/chat/:partnerId
 */
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { partnerId } = req.params;
  const { content } = req.body;

  const isCustomer = req.user.role === 'customer';
  const customerId = isCustomer ? req.user._id : partnerId;
  const restaurantId = isCustomer ? partnerId : req.user._id;

  if (isCustomer) {
    await validateRestaurantAccess(restaurantId);
  }

  const senderModel = isCustomer ? 'User' : 'Restaurant';
  const receiverModel = isCustomer ? 'Restaurant' : 'User';
  const receiverId = isCustomer ? restaurantId : customerId;

  const message = await Message.create({
    customer: customerId,
    restaurant: restaurantId,
    sender: req.user._id,
    senderModel,
    receiver: receiverId,
    receiverModel,
    content,
  });

  const conversationId = `${customerId}_${restaurantId}`;

  const notification = await Notification.create({
    recipient: receiverId,
    recipientModel: receiverModel,
    type: 'newMessage',
    title: 'رسالة جديدة 💬',
    message: content,
    relatedMessage: message._id,
  });

  const io = req.app.get('io');
  if (io) {
    emitToConversation(io, conversationId, 'newMessage', message);
    emitToUser(io, receiverId.toString(), 'newNotification', notification);
  }

  res.status(201).json({
    status: 'success',
    data: message,
  });
});

/**
 * 3) عرض كل محادثاتي (قائمة الشات)
 * GET /api/chat
 */
exports.getMyConversations = catchAsync(async (req, res, next) => {
  const isCustomer = req.user.role === 'customer';
  const matchField = isCustomer ? 'customer' : 'restaurant';
  const partnerField = isCustomer ? 'restaurant' : 'customer';

  const conversations = await Message.aggregate([
    { $match: { [matchField]: req.user._id } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: `$${partnerField}`,
        lastMessage: { $first: '$content' },
        lastMessageAt: { $first: '$createdAt' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', req.user._id] },
                  { $eq: ['$isRead', false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { lastMessageAt: -1 } },
    {
      $lookup: {
        from: isCustomer ? 'restaurants' : 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'partnerInfo',
      },
    },
    { $unwind: '$partnerInfo' },
    {
      $project: {
        _id: 0,
        partnerId: '$_id',
        partnerName: isCustomer
          ? '$partnerInfo.restaurantName'
          : '$partnerInfo.name',
        partnerLogo: isCustomer ? '$partnerInfo.logo' : '$partnerInfo.profileImage',
        lastMessage: 1,
        lastMessageAt: 1,
        unreadCount: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: conversations,
  });
});

/**
 * 4) عدد الرسائل الكلي اللي مقروتش
 * GET /api/chat/unread-count
 */
exports.getUnreadMessagesCount = catchAsync(async (req, res, next) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    status: 'success',
    unreadCount: count,
  });
});

exports.getChatContacts = catchAsync(async (req, res, next) => {
  if (req.user.role === 'customer') {
    const restaurants = await Restaurant.find({ isActive: true, isApproved: true })
      .select('restaurantName logo isActive')
      .sort({ restaurantName: 1 });
    return res.status(200).json({ status: 'success', data: restaurants });
  }

  const customers = await User.find({ role: 'customer', isActive: true, isVerified: true })
    .select('name profileImage isActive')
    .sort({ name: 1 });
  res.status(200).json({ status: 'success', data: customers });
});