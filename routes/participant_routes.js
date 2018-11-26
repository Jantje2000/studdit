let routes = require('express').Router();
let participantController = require('../controllers/participant_controller');

routes.get('/studentenhuis/:id/maaltijd/:maaltijdId/deelnemers', participantController.getParticipants);
routes.post('/studentenhuis/:id/maaltijd/:maaltijdId/deelnemers', participantController.createParticipant);
routes.delete('/studentenhuis/:id/maaltijd/:maaltijdId/deelnemers', participantController.deleteParticipant);

module.exports = routes;