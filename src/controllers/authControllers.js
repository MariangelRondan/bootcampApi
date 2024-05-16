const BootcampModel = require("../models/BootcampModel");
const ErrorResponse = require("../utils/errorResponses");
const asyncHandler = require('../middlewere/async');
const UserModel = require("../models/UserModel");
const sendEmailUtil = require('../utils/sendEmail')
const crypto = require('crypto')

//Register user
//@route  POST /api/v1/auth/register
//@access Public

const register = asyncHandler(async(req,res,next) => {
    const {name, email, password, role} = req.body;


    //create User
    const user = await UserModel.create({
        name, email, password, role
    })
    
     //creates token and cookie
     sendTokenResponse(user, 200, res)
})


//Login User
//@route  POST /api/v1/auth/login
//@access Public

const login = asyncHandler(async (req,res,next) => {
    const {email, password} = req.body;

    //Validate email & password
    if(!email  || !password){
    return next(new ErrorResponse('Please provide an email and password', 400))
    }
    
    //Check User
    const user = await UserModel.findOne({email}).select('+password')

    if(!user){
     return next(new ErrorResponse('Invalid credentials', 401))
    }

    //Check password match
    const isMatch = await user.matchPassword(password)

    if(!isMatch){
    return next(new ErrorResponse('Invalid credentials', 401))

    }
    
    //creates token and cookie
    sendTokenResponse(user, 200, res)
})


//@Descr  Log Out / Clear cookie
//@route  POST /api/v1/auth/logout
//@access Private

const logOut = asyncHandler(async(req, res, next) => { //we get req.user from the auth middlewere
    //take the cookie and set it to none
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        data: {}
    })
})


//@Descr  Get current user logged in
//@route  POST /api/v1/auth/me
//@access Private

const getMe = asyncHandler(async(req, res, next) => { //we get req.user from the auth middlewere
    const {id} = req.user
    const user = await UserModel.findById(id)

    res.status(200).json({
        success: true,
        data: user
    })
})


//@Descr  Forgot password
//@route  POST /api/v1/auth/forgotpassword
//@access Public

const forgotpassword = asyncHandler(async(req, res, next) => { //we get req.user from the auth middlewere
 const {email} = req.body; 

    const user = await UserModel.findOne({email: email})

    if(!user){
        return next(new ErrorResponse('Theres no user with that email', 404))    
    }


    //Get reset token. that is a method in the user model
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetUrl = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/auth/resetpassword/${resetToken}`;

          const message = `You have recieved this email because you (or someone else) has requested the reset of password. Please make a put req to: \n\n ${resetUrl} ` //in a frontend this message would include the link to the form to reset the password

    try {
        await sendEmailUtil({
            email: user.email,
            subject: 'Password reset token',
            message: message,
        })

        res.status(200).json({success: true, data: 'Email sent', token: resetToken})
    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false})
        return next(new ErrorResponse('Email could not be sent', 404))    

    }


    res.status(200).json({
        success: true,
        data: user
    })
});

//@Descr Reset password
//@route  PUT /api/v1/auth/resetpassword/:resettoken
//@access Public

const resetPassword = asyncHandler(async(req, res, next) => { //we get req.user from the auth middlewere
    const {resettoken} = req.params;


    const resetPasswordToken = crypto.createHash('sha256').update(resettoken).digest('hex');



    const user = await UserModel.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })
    console.log('usr',user)
    console.log(req.body.password)
    if(!user) {
        return next(new ErrorResponse('Invalid token', 404))    
    }
    

    //Set the new passwordd
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire= undefined;
    await user.save({validateBeforeSave: false});
    console.log('console antres de send token response', user)

    sendTokenResponse(user, 200, res)
   
})

//@Descr Update User Details
//@route  PUT /api/v1/auth/updatedetails

const updateDetails = asyncHandler(async(req, res, next) => { //we get req.user from the auth middlewere

    const fieldsToUpdate={
        name:  req.body.name,
        email: req.body.email
    }

   

    const user = await UserModel.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    })

    console.log('user', user)

    res.status(200).json({
        success: true,
        data: user
    })
   
})

//@Descr Update User Password
//@route  PUT /api/v1/auth/updatedetails

const updatePassword = asyncHandler(async(req, res, next) => { //we get req.user from the auth middlewere

    const user = await UserModel.findById(req.user.id).select('+password'); //pq en el modelo puismos que no aparezcla la pass en las peticiones

    //Check current password
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Incorrect password', 401))
    }

    user.password = req.body.newPassword;
    await user.save()

    sendTokenResponse(user, 200, res)
   
})




//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create Token
    const token = user.getSignedInToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), //20 days from 'now'
        httpOnly: true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({success: true, token})
}




module.exports = {
    register,
    login,
    logOut,
    getMe,
    forgotpassword,
    resetPassword,
    updateDetails,
    updatePassword
}