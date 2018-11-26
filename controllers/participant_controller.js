const ApiError = require('../models/api_error');
const ParticipantResponse = require('../models/participant_response');
const auth = require('../auth/authentication');
const db = require('./db');

module.exports = {
    createParticipant(req, res) {
        const token = (req.header('X-Access-Token')) || '';

        auth.decodeToken(token, (err, payload) => {
            if (err) {
                console.log("An error occurred!");
                console.log(error);
                throw err;
            }
            else {
                let id = payload.sub;

                db.query("SELECT * FROM view_deelnemers WHERE Email = " +
                    "(SELECT Email FROM user WHERE ID = ?) AND StudentenhuisID = ? AND MaaltijdID = ?" +
                    "", [id, req.params.id, req.params.maaltijdId], (err, result) => {
                    if(result.length < 1){
                        db.query("INSERT INTO Deelnemers(UserId, StudentenhuisId, MaaltijdId)VALUES(?, ?, ?)", [id, req.params.id, req.params.maaltijdId], (err, result) => {
                            if (err) {
                                console.log("An error occurred!");
                                console.log(err);
                                res.status(409).json(new ApiError("This dormitory or meal are not existing")).end();
                            } else {
                                db.query("SELECT * FROM user WHERE ID = ?", [id], (err, result) => {
                                    result = result[0];
                                    res.status(200).json(new ParticipantResponse(
                                        result["Voornaam"], result["Achternaam"], result["Email"]
                                    )).end()
                                });
                            }
                        });
                    }else{
                        res.status(409).json(new ApiError("Sorry, you was already participant", 409)).end();
                    }
                });
            }
        });
    },
    getParticipants(req, res) {
        db.query("SELECT * FROM studentenhuis WHERE ID = ?", [req.params.id], (err, result) => {
            if (result.length != 0){
                db.query("SELECT * FROM maaltijd WHERE ID = ?", [req.params.maaltijdId], (err, result) => {
                    if(result.length != 0){
                        db.query("SELECT * FROM view_deelnemers WHERE StudentenhuisID = ? OR MaaltijdID = ?;", [req.params.id, req.params.maaltijdId], function (err, result) {
                            let response = [];
                            let participant;

                            for (result_item in result) {
                                participant_item = result[result_item];
                                response.push(new ParticipantResponse(
                                    participant_item["Voornaam"],
                                    participant_item["Achternaam"],
                                    participant_item["Email"],
                                ));
                            }

                            res.status(200).json(response).end();
                        });
                    } else{
                        res.status(404).json(new ApiError("Sorry, but this meal does not exist")).end();
                    }
                });
            }else{
                res.status(404).json(new ApiError("Sorry, but this dormitory does not exist")).end();
            }
        });
    },
    deleteParticipant(req, res) {
        const token = (req.header('X-Access-Token')) || '';

        auth.decodeToken(token, (err, payload) => {
            if (err) {
                throw err;
            }
            else {
                let id = payload.sub;

                db.query("SELECT * FROM view_deelnemers WHERE Email = " +
                    "(SELECT Email FROM user WHERE ID = ?) AND StudentenhuisID = ? AND MaaltijdID = ?" +
                    "", [id, req.params.id, req.params.maaltijdId], (err, result) => {
                    if (result.length > 0) {
                        db.query("DELETE FROM Deelnemers WHERE UserID = ? AND StudentenhuisID = ? AND MaaltijdID = ?;", [id, req.params.id, req.params.maaltijdId], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.status(500).json(new ApiError("Some error occurred"), 500).end();
                            } else {
                                res.status(200).json({}).end()
                            }
                        });
                    } else {
                        res.status(409).json(new ApiError("Sorry, you are not a participant who can cancel", 409)).end();
                    }
                });
            }
        });
    }
};