const ApiError = require('../models/api_error');
const Meal = require('../models/meal');
const auth = require('../auth/authentication');
const db = require('./db');

module.exports = {
    createMeal(req, res) {
        if (!req.body.naam) {
            console.log('The name is missing from the body');
            res.status(412).json(new ApiError("The name must be provided", 412)).end()
        } else if (!req.body.beschrijving) {
            console.log('The description is missing from the body');
            res.status(412).json(new ApiError("The description must be provided", 412)).end()
        } else if (!req.body.ingredienten) {
            console.log('The ingredients are missing from the body');
            res.status(412).json(new ApiError("The ingredients must be provided", 412)).end()
        } else if (!req.body.allergie) {
            console.log('The allergy is missing from the body');
            res.status(412).json(new ApiError("The allergy must be provided", 412)).end()
        } else if (!req.body.prijs) {
            console.log('The price is missing from the body');
            res.status(412).json(new ApiError("The price must be provided", 412)).end()
        } else {
            const name = req.body.naam;
            const description = req.body.beschrijving;
            const ingredients = req.body.ingredienten;
            const allergy = req.body.allergie;
            const price = req.body.prijs;

            let meal = new Meal(name, description, ingredients, allergy, price);

            const token = (req.header('X-Access-Token')) || '';

            auth.decodeToken(token, (err, payload) => {
                if (err) {
                    console.log("An error occurred!");
                    console.log(err);
                    throw err;
                }
                else {
                    let id = payload.sub;
                    meal.save(id, req.params.id, () => {
                        meal.toResponse((response) => {
                            res.status(200).json(response).end();
                        });
                    });
                }
            });
        }
    },
    getMeals(req, res) {
        db.query("SELECT * FROM maaltijd WHERE StudentenhuisID = ?;", [req.params.id], function (err, result) {
            let response = [];
            let meal;

            console.log("Return all meals of a dormitory");

            for (result_item in result) {
                meal = new Meal();

                meal.setId(result[result_item]["ID"]);

                meal.toResponse((response_item) => {
                    response.push(response_item);

                    if (response.length === result.length) {
                        res.status(200).json(response).end();
                    }
                });
            }
        });
    },
    getMealById(req, res) {
        let dormitoryId = req.params.id;
        let mealId = req.params.maaltijdId;

        let meal = new Meal();

        console.log("Return meal by Id");

        db.query("SELECT * FROM maaltijd WHERE studentenhuisID = ? AND ID = ?", [dormitoryId, mealId], (err, result) => {
            if (result[0]) {
                meal.setId(result[0]["ID"]);

                meal.toResponse((response) => {
                    res.status(200).json(response).end();
                });
            } else {
                res.status(404).json(new ApiError("This home does not exist", 404)).end();
            }
        });

    },
    updateMeal(req, res) {
        if (!req.body.naam) {
            console.log('The name is missing from the body');
            res.status(412).json(new ApiError("The name must be provided", 412)).end()
        } else if (!req.body.beschrijving) {
            console.log('The description is missing from the body');
            res.status(412).json(new ApiError("The description must be provided", 412)).end()
        } else if (!req.body.ingredienten) {
            console.log('The ingredients are missing from the body');
            res.status(412).json(new ApiError("The ingredients must be provided", 412)).end()
        } else if (!req.body.allergie) {
            console.log('The allergy is missing from the body');
            res.status(412).json(new ApiError("The allergy must be provided", 412)).end()
        } else if (!req.body.prijs) {
            console.log('The price is missing from the body');
            res.status(412).json(new ApiError("The price must be provided", 412)).end()
        } else {
            let dormitoryId = req.params.id;
            let mealId = req.params.maaltijdId;

            const name = req.body.naam;
            const description = req.body.beschrijving;
            const ingredients = req.body.ingredienten;
            const allergy = req.body.allergie;
            const price = req.body.prijs;

            db.query("SELECT * FROM maaltijd WHERE ID = ?", [mealId], (err, maaltijdResult) => {
                if (maaltijdResult[0]) {
                    const token = (req.header('X-Access-Token')) || ''; // get token

                    console.log(maaltijdResult);

                    auth.decodeToken(token, (err, payload) => {
                        if (err) {
                            console.log("An error occurred!");
                            console.log(err);
                            throw err;
                        }
                        else {
                            console.log(payload);
                            let id = payload.sub;

                            if (maaltijdResult[0]["UserID"] === id) {
                                let meal = new Meal(name, description, ingredients, allergy, price);

                                meal.setId(maaltijdResult[0]["ID"]);

                                // update
                                meal.update(() => {
                                    meal.toResponse((response) => {
                                        res.status(200).json(response).end();
                                    });
                                });
                            } else {
                                res.status(409).json(new ApiError("You could not edit this data", 409)).end();
                            }
                        }
                    });
                } else {
                    res.status(404).json(new ApiError("This home does not exist", 404)).end();
                }
            });
        }
    },
    deleteMeal(req, res) {
        const dormitoryId = req.params.id;
        let mealId = req.params.maaltijdId;

        console.log("Delete a meal of a dormitory");

        db.query("SELECT * FROM maaltijd WHERE ID = ? AND StudentenhuisID = ?", [mealId, dormitoryId], (err, mealResult) => {
            if (mealResult[0]) {
                const token = (req.header('X-Access-Token')) || ''; // get token

                console.log(mealResult);

                auth.decodeToken(token, (err, payload) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        let id = payload.sub;

                        if (mealResult[0]["UserID"] === id) {
                            db.query("DELETE FROM maaltijd WHERE ID = ?", [mealId, dormitoryId], (err, result) => {
                                res.status(200).json({}).end();
                            });

                        } else {
                            res.status(409).json(new ApiError("You could not delete this data", 409)).end();
                        }
                    }
                });
            } else {
                res.status(404).json(new ApiError("This home does not exist", 404)).end();
            }
        });
    }
};