class DormitoryResponse {

    constructor(id, name, address, contact, email){
        this.id = id; // id of dormitory
        this.name = name; // name of dormitory
        this.address = address; // address of dormitory

        this.contact = contact; // name of contact (user who registered this dormitory)
        this.email = email; // email of contact (to identify, because the email is always unique)
    }

}

module.exports = DormitoryResponse;
