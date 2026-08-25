const Notification = require('../../models/Notification');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');

/**
 * موديول Notification: مشترك بين كل الأدوار (customer, restaurant, admin)
 * كل واحد بيشوف بس الإشعارات اللي ليه هو (recipient = req.user._id)
 */

/**
 * 1) عرض كل إشعاراتي
 * GET /api/notifications
 * Query params (اختيارية): unreadOnly=true -> بس اللي مقروتش
 */
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const { unreadOnly } = req.query;

  const filter = { recipient: req.user._id };
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter).sort({
    createdAt: -1,
  });

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    unreadCount,
    data: notifications,
  });
});

/**
 * 2) تعليم إشعار واحد كمقروء
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return next(new ApiError('الإشعار غير موجود أو لا يخصك', 404));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    status: 'success',
    message: 'تم تعليم الإشعار كمقروء',
    data: notification,
  });
});

/**
 * 3) تعليم كل الإشعارات كمقروءة دفعة واحدة
 * PATCH /api/notifications/read-all
 */
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'تم تعليم كل الإشعارات كمقروءة',
  });
});

/**
 * 4) حذف إشعار واحد
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return next(new ApiError('الإشعار غير موجود أو لا يخصك', 404));
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'تم حذف الإشعار بنجاح',
  });
});