let routes = require('express').Router();
let mealController = require('../controllers/meal_controller');

routes.post('/studentenhuis/:id/maaltijd', mealController.createMeal);
routes.get('/studentenhuis/:id/maaltijd', mealController.getMeals);
routes.get('/studentenhuis/:id/maaltijd/:maaltijdId', mealController.getMealById);
routes.put('/studentenhuis/:id/maaltijd/:maaltijdId', mealController.updateMeal);
routes.delete('/studentenhuis/:id/maaltijd/:maaltijdId', mealController.deleteMeal);

module.exports = routes;
