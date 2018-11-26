let express = require('express');
let routes = express.Router();
let dormitoryController = require('../controllers/dormitory_controller');

routes.get('/studentenhuis', dormitoryController.readDormitory);
routes.get('/studentenhuis/:id', dormitoryController.getDormitoryById);
routes.post('/studentenhuis', dormitoryController.createDormitory);
routes.put('/studentenhuis/:id', dormitoryController.updateDormitory);
routes.delete('/studentenhuis/:id', dormitoryController.deleteDormitory);

module.exports = routes;
