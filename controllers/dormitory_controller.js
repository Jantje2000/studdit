let Dormitory = require('../models/dormitory');
const assert = require('assert');
const ApiError = require("../models/api_error");
const auth = require("../auth/authentication");
const db = require("./db");

module.exports = {

    createDormitory(req, res, next) {
        if (!req.body.naam) {
            console.log('The name is missing from the body');
            res.status(412).json(new ApiError("The name must be provided", 412)).end()
        }else if (!req.body.adres) {
            console.log('The address is missing from the body');
            res.status(412).json(new ApiError("The address must be provided", 412)).end()
        } else {
            const name = req.body.naam;
            const address = req.body.adres;

            let dormitory = new Dormitory(name, address);

            const token = (req.header('X-Access-Token')) || ''; // Get token

            auth.decodeToken(token, (err, payload) => {
                if(err){
                    console.log("An error occurred");
                    console.log(err);
                }
                console.log(payload);
                dormitory.save(payload.sub, (err) => {
                    if(err){
                        res.status(412).json(err).end();
                    }else{
                        console.log('Dormitory has been saved');
                        dormitory.toResponse((response) => {
                            res.status(200).json(response).end();
                        });
                    }
                });
            });
        }
    },

    readDormitory(req, res, next) {
        db.query("SELECT * FROM view_studentenhuis;", [], function (err, result) {
            let response = [];
            let dormitory;

            for (result_item in result) {
                dormitory = new Dormitory();

                dormitory.setId(result[result_item]["ID"]);

                dormitory.toResponse((response_item) => {
                    response.push(response_item);

                    if (response.length === result.length) {
                        res.status(200).json(response).end();
                    }
                });
            }
        });
    },

    updateDormitory(req, res, next) {
        if (!req.body.naam) {
            console.log('The name is missing from the body');
            res.status(412).json(new ApiError("The name must be provided", 412)).end()
        }else if (!req.body.adres) {
            console.log('The address is missing from the body');
            res.status(412).json(new ApiError("The address must be provided", 412)).end()
        } else {
            let dormitoryId = req.params.id;

            const name = req.body.naam;
            const address = req.body.adres;

            db.query("SELECT * FROM studentenhuis WHERE ID = ?", [dormitoryId], (err, dormitoryResult) => {
                if (dormitoryResult[0]) {
                    const token = (req.header('X-Access-Token')) || ''; // get token

                    console.log(dormitoryResult);

                    auth.decodeToken(token, (err, payload) => {

                        if (dormitoryResult[0]["UserID"] === payload.sub) {
                            let dormitory = new Dormitory(
                                dormitoryResult[0]["Naam"],
                                dormitoryResult[0]["Adres"]
                            );

                            dormitory.setId(dormitoryResult[0]["ID"]);
                            dormitory.setName(name);
                            dormitory.setAddress(address);

                            // update
                            dormitory.update(() => {
                                dormitory.toResponse((response) => {
                                    res.status(200).json(response).end();
                                });
                            });
                        } else {
                            res.status(409).json(new ApiError("You could not edit this data", 409)).end();
                        }
                    });

                } else {
                    res.status(404).json(new ApiError("This home does not exist", 404)).end();
                }
            });
        }
    },

    deleteDormitory(req, res, next) {
        const dormitoryId = req.params.id;

        db.query("SELECT * FROM studentenhuis WHERE ID = ?", [dormitoryId], (err, dormitoryResult) => {
            if (dormitoryResult[0]) {
                const token = (req.header('X-Access-Token')) || ''; // get token

                console.log(dormitoryResult);

                auth.decodeToken(token, (err, payload) => {
                    if (dormitoryResult[0]["UserID"] === payload.sub) {
                        db.query("DELETE FROM studentenhuis WHERE ID = ?", [dormitoryId,], (err, result) => {
                            res.status(200).json({}).end();
                        });

                    } else {
                        res.status(409).json(new ApiError("You could not delete this data", 409)).end();
                    }
                });

            } else {
                res.status(404).json(new ApiError("This home does not exist", 404)).end();
            }
        });
    },

    getDormitoryById(req, res, next) {

        let dormitoryId = req.params.id;

        let dormitory = new Dormitory();

        db.query("SELECT * FROM view_studentenhuis WHERE ID = ?", [dormitoryId], (err, result) => {
            if (result[0]) {
                dormitory.setId(result[0]["ID"]);

                dormitory.toResponse((response) => {
                    res.status(200).json(response).end();
                });
            } else {
                res.status(404).json(new ApiError("This home does not exist", 404)).end();
            }
        });
    }
};