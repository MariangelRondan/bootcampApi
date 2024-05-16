const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next) //se ejecuta el error middlewere, con el ErrorResponse (utils)
}

module.exports = asyncHandler;

//fn es un parámetro que representa una función asincrónica que se pasará como argumento a asyncHandler.
//const asyncHandler = fn => ...: Esta línea define una función llamada asyncHandler que toma un parámetro llamado fn. fn es una función asincrónica que se pasará como argumento a asyncHandler.

//Ejemeplo de uso asyncHandler represeta a fn:
// Envolver la función asincrónica con asyncHandler
//app.get('/ruta', asyncHandler(myAsyncFunction));

//La razón por la que se usa fn como parámetro en asyncHandler es para permitir la reutilización del middleware.
 //Al pasar una función específica a asyncHandler, puedes envolver cualquier función asincrónica en Express y manejarla 
 //de manera segura. Esto hace que tu código sea más modular y fácil de mantener.





