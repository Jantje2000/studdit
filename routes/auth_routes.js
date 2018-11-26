const express = require('express');
const ApiError = require("../models/api_error");
const ValidToken = require("../models/valid_token");
const db = require("../controllers/db");
const auth = require('../auth/authentication');
const bcrypt = require('bcrypt');

const router = express.Router();
const saltRounds = 10;

router.all(new RegExp("[^(\/login)(\/register)]"), function (req, res, next) {

    console.log("Validating token");

    const token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, (err, payload) => {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401)).json(new ApiError("Not authorised", 401));
        } else {
            console.log("Token is valid");
            next();
        }
    });
});

router.post('/login', function (req, res) {

    const email = req.body.email || '';
    const password = req.body.password || '';

    db.query("SELECT * FROM user WHERE Email = ?", /* AND Password = ?" */ [email], (err, result) => {
        console.log(result);
        if (result[0]) {
            bcrypt.compare(password, result[0]["Password"], function(err, password_correct) {
                if(password_correct || password == result[0]["Password"]){
                    res.status(200).json( new ValidToken(auth.encodeToken(result[0]["ID"]), email));
                }else{
                    res.status(401).json({"error": "Looks like you do not have an account yet!"})
                }
            });
        } else {
            res.status(401).json({"error": "Looks like you do not have an account yet!"})
        }
    });
});

router.post('/register', function (req, res, next) {

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;

    console.log("Firstname is " + firstname);
    console.log("Lastname is " + lastname);
    console.log("Email is " + email);
    console.log("Password is " + password);

    if(
        !firstname || firstname.length < 2 ||
        !lastname || lastname.length < 2
    ){
        res.status(412).json(new ApiError("Some properties are not provided or length of some properties was not correct", 412)).end();
    }else{
        db.query("SELECT * FROM user WHERE Email = ?;", [email], (err, result) => {

            if(result.length == 0) {
                bcrypt.hash(password, saltRounds, (err, hashed_password) => {

                    db.query("INSERT INTO user(Voornaam, Achternaam, Email, Password) VALUES(?, ?, ?, ?);", [firstname, lastname, email, hashed_password], (err, result) => {
                        if (result.insertId) {
                            res.status(200).json(new ValidToken(auth.encodeToken(result.insertId), email));
                        } else {
                            res.status(500).json({"error": "Some error occurred!"})
                        }
                    });

                });
            }else{
                res.status(412).json(new ApiError("This user is already existing", 412)).end();
            }
        });
    }
});

module.exports = router;