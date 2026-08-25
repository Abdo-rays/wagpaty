const express = require('express');
const router = express.Router();

const adminController = require('./admin.controller');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');

const {
  rejectRestaurantSchema,
  toggleStatusSchema,
  banSchema,
} = require('./admin.validation');

router.use(protect, restrictTo('admin'));
router.get('/overview', adminController.getOverview);

router.get('/restaurants', adminController.getAllRestaurants);
router.get('/restaurants/:id', adminController.getRestaurant);

router.patch('/restaurants/:id/approve', adminController.approveRestaurant);


router.patch(
  '/restaurants/:id/reject',
  validate(rejectRestaurantSchema),
  adminController.rejectRestaurant
);

router.patch(
  '/restaurants/:id/toggle-status',
  validate(toggleStatusSchema),
  adminController.toggleRestaurantStatus
);

router.delete('/restaurants/:id', adminController.deleteRestaurant);
router.patch('/restaurants/:id/ban', validate(banSchema), adminController.banRestaurant);
router.patch('/restaurants/:id/unban', adminController.unbanRestaurant);

router.get('/customers', adminController.getAllCustomers);
router.get('/customers/:id', adminController.getCustomer);

router.patch(
  '/customers/:id/toggle-status',
  validate(toggleStatusSchema),
  adminController.toggleCustomerStatus
);

router.delete('/customers/:id', adminController.deleteCustomer);
router.patch('/customers/:id/ban', validate(banSchema), adminController.banCustomer);
router.patch('/customers/:id/unban', adminController.unbanCustomer);
router.get('/meals', adminController.getAllMeals);
router.delete('/meals/:id', adminController.deleteMeal);

router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderDetails);
router.delete('/orders/:id', adminController.deleteOrder);

module.exports = router;