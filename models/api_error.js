class ApiError {

    constructor(message, code){
        this.message = message;
        this.code = code;
        this.datetime = new Date()
    }

}

module.exports = ApiError;
