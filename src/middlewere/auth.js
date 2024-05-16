const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponses");
const UserModel = require("../models/UserModel");


//Protect routes
const protect = asyncHandler(async(req, res, next)=> {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        //set token from Bearer in header
        token = req.headers.authorization.split(' ')[1]; // ['Bearer', 'djjdjdj38338==??(('] Me quedo con el token
    } else if(req.cookies.token){  //ya no es necesario mandarlo en el header, se manda por la cookie
        //Set token from cookie
         token = req.cookies.token
    } 

    //Make sure token exists
    if(!token){
        return next(new ErrorResponse('Not authorized', 401))
    }

    //verify token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
//decoded = {id: 'userId', iat: 2352345, exp: 35234543}  gets the user id from the jwt body
        req.user = await UserModel.findById(decoded.id)
        next()
    }catch(err){
        return next(new ErrorResponse('Not authorized', 401))
    }


})

//Grand access to specific roles
const authorize = (...roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
          return next(new ErrorResponse(`User role ${req.user.role} is unauthorized`, 403))   
        }
        next()
    }
}


module.exports = {protect,authorize};