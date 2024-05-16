const ErrorResponse = require("../utils/errorResponses");
const asyncHandler = require('../middlewere/async');
const UserModel = require("../models/UserModel");

//@Desc    Get all users
//@route  GET /api/v1/auth/users
//@access Private/Admin

const getAllUsers = asyncHandler(async(req,res,next) => {
    
res.status(200).json(res.advancedResults);

})

//@Desc    Get user by id
//@route  GET /api/v1/auth/users/:id
//@access Private/Admin
const getUserById = asyncHandler(async(req,res,next) => {
    const {id} = req.params;

    const user = UserModel.findById(id);

    // if(!user){}

    res.status(200).json({
        success: true,
        data: user
    });
    
    })

//@Desc   Create a user
//@route  POST /api/v1/auth/users
//@access Private/Admin
const postUser = asyncHandler(async(req,res,next) => {
    

    const user = UserModel.create(req.body);

    // if(!user){}

    res.status(201).json({
        success: true,
        data: user
    });
    
    })


//@Desc   Update a user
//@route  PUT /api/v1/auth/users/:id
//@access Private/Admin
const updateUser = asyncHandler(async(req,res,next) => {
    const {id} = req.params;

    const user = UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    // if(!user){}

    res.status(201).json({
        success: true,
        data: user
    });
    
    })

//@Desc   Delete a user
//@route  DELETE /api/v1/auth/users/:id
//@access Private/Admin
const deleteUser = asyncHandler(async(req,res,next) => {
    const {id} = req.params;

    const user = UserModel.findByIdAndDelete(id);

    // if(!user){}

    res.status(201).json({
        success: true,
        data: {}
    });
    
    })




    module.exports = {
        getAllUsers,
        getUserById,
        postUser,
        updateUser,
        deleteUser

    }