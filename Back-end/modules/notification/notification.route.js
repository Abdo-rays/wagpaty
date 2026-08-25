const express = require('express');
const router = express.Router();

const notificationController = require('./notification.controller');
const { protect } = require('../../middlewares/auth');

/**
 * كل الراوتس هنا محتاجة اليوزر يكون عامل login بس
 * (مفيش restrictTo لأي role معين، أي حد "customer/restaurant/admin" ليه إشعاراته)
 */
router.use(protect);

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;