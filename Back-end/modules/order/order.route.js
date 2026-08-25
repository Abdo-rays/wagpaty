const express = require('express');
const router = express.Router();

const orderController = require('./order.controller');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');

const {
  createOrderSchema,
  rejectOrderSchema,
  cancelOrderSchema,
} = require('./order.validation');


router.use(protect);

router.post(
  '/',
  restrictTo('customer'),
  validate(createOrderSchema),
  orderController.createOrder
);

router.get('/my-orders', restrictTo('customer'), orderController.getMyOrders);

router.patch(
  '/:id/cancel',
  restrictTo('customer'),
  validate(cancelOrderSchema),
  orderController.cancelOrder
);
router.get(
  '/restaurant-orders',
  restrictTo('restaurant'),
  orderController.getRestaurantOrders
);

router.patch(
  '/:id/accept',
  restrictTo('restaurant'),
  orderController.acceptOrder
);

router.patch(
  '/:id/reject',
  restrictTo('restaurant'),
  validate(rejectOrderSchema),
  orderController.rejectOrder
);

router.patch(
  '/:id/on-the-way',
  restrictTo('restaurant'),
  orderController.markOrderOnTheWay
);

router.patch(
  '/:id/deliver',
  restrictTo('restaurant'),
  orderController.markOrderDelivered
);
router.get('/:id', orderController.getOrder);

module.exports = router;