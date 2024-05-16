const ErrorResponse = require("../utils/errorResponses");

const errorHandler =(err, req, res, next) => {
    let error = {...err} //err es un obj, guardo todas las prop de err en error

    error.message = err.message;


    //Mongoose bad ObjectId
    if(err.name === 'CastError'){ //es el error que sale cuando pones un formato de id distinto al _id
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404)
    } 

    //mongoose Duplicate key |Cuando agregamos un nuevo valor que deberia ser unico, y no es, el error tiene ese code
    if(err.code === 11000) {
        const message = 'Duplicate field value entered'
        error = new ErrorResponse(message, 400)
    }

    //Mongoose Validation error | Mapea el error y busca el mensaje de validacion q pusimos en el modelo
    //Si son varios errores, aparecen separados por coma ej: {error: "Please add an address, Please add a description, Please add a name"} | Sirve para los alerts.
    if(err.name === 'ValidationError'){
        let messages;
        if(Array.isArray(err.errors)) {
            messages = err.errors.map(validator => validator.message);
        } else {
            messages = [err.message];
        }
        error = new ErrorResponse(messages, 400);
    }
     
    res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
})
} 

module.exports = errorHandler;