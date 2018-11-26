class MealResponse{

    constructor(id, name, description, ingredients, allergy, price){
        this.id = id;
        this.name = name;
        this.description = description;
        this.ingredients = ingredients;
        this.allergy = allergy;
        this.price = price;
    }

}

module.exports = MealResponse;