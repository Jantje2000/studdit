const db = require("../controllers/db");
const api_error = require('../models/api_error');

class Dormitory {

    constructor(name, address) {


        this.name = name;
        this.address = address;
    }

    setId(id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    setName(name){
        this.name = name;
    }

    getAddress() {
        return this.name;
    }

    setAddress(address){
        this.address = address;
    }

    save(userId, callback) {
        if(!(this.name.match(new RegExp("^[a-zA-Z_\\-]+$")))){
            callback(new api_error("Please make sure you name only uses letters.", 412));
        }
        else if(!(this.address.match(new RegExp("[a-zA-Z]* [0-9]*")))){
            callback(new api_error("Please make sure your address only uses letters and numbers.", 412));
        } else{

        db.query("INSERT INTO studentenhuis(Naam, Adres, UserID)VALUES(?, ?, ?)", [this.name, this.address, userId.toString()], (err, result) => {
            this.setId(result.insertId);
            callback();
        });}
    }

    update(callback){
        db.query("UPDATE studentenhuis SET Naam = ?, Adres = ? WHERE ID = ?", [this.name, this.address, this.id.toString()], (err, result) => {
            callback();
        });
    }

    toResponse(callback) {
        db.query("SELECT * FROM view_studentenhuis WHERE ID = ?", [this.id], function (err, result) {
            callback({
                "ID": result[0]["ID"],
                "naam": result[0]["Naam"],
                "adres": result[0]["Adres"],
                "contact": result[0]["Contact"],
                "email": result[0]["Email"]
            });
        });
    }
}

module.exports = Dormitory;