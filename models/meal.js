const db = require("../controllers/db");

class Meal{

    constructor(name, description, ingredients, allergy, price){
        this.name = name;
        this.description = description;
        this.ingredients = ingredients;
        this.allergy = allergy;
        this.price = price;
    }

    setId(id){
        this.id = id;
    }

    save(userId,studentenhuisId, callback) {
        db.query("INSERT INTO maaltijd(Naam, Beschrijving, Ingredienten, Allergie, Prijs, UserId, StudentenhuisID)VALUES(?, ?, ?, ?, ?, ?, ?)", [this.name, this.description, this.ingredients, this.allergy, this.price, userId.toString(), studentenhuisId], (err, result) => {
            this.setId(result.insertId);
            callback();
        });
    }

    toResponse(callback){
        db.query("SELECT * FROM maaltijd WHERE ID = ?", [this.id], function (err, result) {
            callback({
                "ID": result[0]["ID"],
                "naam": result[0]["Naam"],
                "beschrijving": result[0]["Beschrijving"],
                "ingredienten": result[0]["Ingredienten"],
                "allergie": result[0]["Allergie"],
                "prijs": result[0]["Prijs"]
            });
        });
    }

    update(callback) {
        db.query("UPDATE maaltijd SET Naam = ?, Beschrijving = ?, Ingredienten = ?, Allergie = ? , Prijs = ? WHERE ID = ?", [this.name, this.description, this.ingredients, this.allergy, this.price, this.id.toString()], (err, result) => {
            if(err){
                console.log("An error occurred");
                console.log(err);
            }
            callback();
        });
    }
}

module.exports = Meal;