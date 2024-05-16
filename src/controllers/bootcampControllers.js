const BootcampModel = require("../models/BootcampModel");
const ErrorResponse = require("../utils/errorResponses");
const asyncHandler = require('../middlewere/async');
const geocoder = require("../utils/geocoder");
const path = require("path");

const getBootcamps = (async (req, res, next) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (error) {
        // Manejar errores
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
})

const getBootcampById =asyncHandler( async (req, res, next) =>{
  
        const {id} = req.params;

        const bootcamp = await BootcampModel.findById(id);

        if(!bootcamp){
           return next(new ErrorResponse(`Bootcamp with ID: ${req.params.id} was not found`, 404))

        } 
        res.status(200).json({success: true, data: bootcamp})

   
 

})

//Create bootcamp
//@access Private
//@route POST /api/v1/bootcamp
const postBootcamp = asyncHandler(async (req, res, next) => {

    //add user to req.body (the one logged in) we get req.user por el middlewere auth
    req.body.user = req.user.id;

    //Busca los bootcamps que creo el usuario loggead
    const publishedBootcamp= await BootcampModel.findOne({user: req.user.id})
    console.log(publishedBootcamp)

    //Only the admin can create many bootcamps, publishers can create only one
    if(publishedBootcamp && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID: ${req.user.id} has already published a bootcamp`, 404))
    }
  
    const newBootcamp = await BootcampModel.create(req.body)
      
    res.status(201).json({success: true, data: newBootcamp})
    
});

const updateBootcamp = asyncHandler(async (req, res, next) => {

    const {id} = req.params;
    const update = req.body;
    let bootcamp = await BootcampModel.findById(id)

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp with ID: ${id} was not found`, 404))
    }

    //Make sure the user logged in is the bootcamp owner. Paso bootcamp.user a string pq es un objectId
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID: ${id} is not authorized to update this bootcamp`, 401))
    }

    bootcamp = await BootcampModel.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true
    })

    res.status(200).json({success: true, data: bootcamp})

})

const deleteBootcamp = asyncHandler(async (req, res, next) => {
        const {id} = req.params;
        const bootcamp = await BootcampModel.findById(id)
    
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp with ID: ${id} was not found`, 404))

        }

         //Make sure the user logged in is the bootcamp owner. Paso bootcamp.user a string pq es un objectId
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID: ${id} is not authorized to update this bootcamp`, 401))
    }


        bootcamp.deleteOne()
    
        res.status(200).json({success: true, data: {}})

})


// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
   const {zipcode, distance} = req.params;

   //get lat/long from geocoder
   const loc= await geocoder.geocode(zipcode);
  console.log(loc[1])
   const lat = loc[1].latitude;
   const lng = loc[1].longitude;

   //calc radius using radians -> divide distance by radius of Earth. Earth Radius: 3963 miles
   const radius = (distance / 3963);

   const bootcamps = await BootcampModel.find({
    location: {
        $geoWithin: {
            $centerSphere: [[lng, lat], radius]
        }
    }
});
   console.log('boot', bootcamps)
     res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
     })


})

//Upload a foto
//@route PUT api/v1/bootcamps/:id/photo

const bootcampPhoto = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    const bootcamp = await BootcampModel.findById(id)

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp with ID: ${req.params.id} was not found`, 404))
    }

    
     //Make sure the user logged in is the bootcamp owner. Paso bootcamp.user a string pq es un objectId
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID: ${id} is not authorized to update this bootcamp`, 401))
    }

    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`, 400))
    }

    const file = req.files.file;

    //Make sure it is a photo . If it is a photo ->  mimetype: image/jpeg
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Invalid format. Please upload an image file`, 400))
    }

    //Check file size
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }

    //Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}` //path le agrega el .png o el .jpg al final del filename
    
    //file tiene una prop mv que es para indicarle el directorio donde quiero que se guarde la img
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.error(err);
            return next(new ErrorResponse(`Problem uploading the photo`, 500))
        }

        await BootcampModel.findByIdAndUpdate(id, {
            photo: file.name
        })

        res.status(200).json({success: true, data: file.name})
    })
})

module.exports = {
    getBootcamps, 
    postBootcamp,
    getBootcampById,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhoto
}