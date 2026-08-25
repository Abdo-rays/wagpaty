const express = require('express');
const router = express.Router();

const mealController = require('./meal.controller');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');

const { addMealSchema, updateMealSchema } = require('./meal.validation');


router.post(
  '/',
  protect,
  restrictTo('restaurant'),
  validate(addMealSchema),
  mealController.addMeal
);

router.get(
  '/my-meals',
  protect,
  restrictTo('restaurant'),
  mealController.getMyMeals
);

router.get(
  '/my-meals/:id',
  protect,
  restrictTo('restaurant'),
  mealController.getMyMeal
);

router.patch(
  '/:id',
  protect,
  restrictTo('restaurant'),
  validate(updateMealSchema),
  mealController.updateMeal
);

router.delete(
  '/:id',
  protect,
  restrictTo('restaurant'),
  mealController.deleteMeal
);

router.get('/restaurant/:restaurantId', mealController.getRestaurantMeals);
router.get('/:id', mealController.getMeal);

module.exports = router;