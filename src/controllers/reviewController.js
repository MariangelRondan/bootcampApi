const BootcampModel = require("../models/BootcampModel");
const ErrorResponse = require("../utils/errorResponses");
const asyncHandler = require('../middlewere/async');
const ReviewModel = require("../models/ReviewModel");

//@route GET /api/v1/bootcamps/:bootcampId/reviews
//@route GET /api/v1/bootcamps/reviews

const getReviews = asyncHandler(async(req, res, next) => {
    const {bootcampId} = req.params;
  

    if(bootcampId){
        const reviews = await ReviewModel.find({bootcamp: bootcampId})

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {
      
        res.status(200).json(res.advancedResults)//los resultados que da el middlewere
    }


});


//@route GET /api/v1/bootcamps/reviews/:id
//@access  Public

const getReviewById = asyncHandler(async(req, res, next) => {
    const {id} = req.params;
  
    const review = await ReviewModel.findById(id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!review) {
        return next(new ErrorResponse(`No review found with ID: ${id}`, 404))
    }
   
    res.status(200).json({
        success: true,
        data: review
    })


});

//@route POST /api/v1/bootcamps/:bootcampId/reviews
//@access  Private

const postReview = asyncHandler(async(req, res, next) => {
const {bootcampId} = req.params

    req.body.bootcamp = bootcampId; //agrego el bootcamp id al cuerpo del req para que se guarde en la DB
    req.body.user = req.user.id; //req.user lo obtengo del middlewere
   
    const bootcamp = await BootcampModel.findById(bootcampId);

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp found with ID: ${bootcampId}`, 404))

    }

    const review = await ReviewModel.create(req.body)

    res.status(201).json({
        success: true,
        data: review
    })


});


//@route PUT /api/v1/bootcamps/reviews/:id
//@access  Private

const updateReview = asyncHandler(async(req, res, next) => {
    const {id} = req.params
    
        let review = await ReviewModel.findById(id);
    
        if(!review){
            return next(new ErrorResponse(`No review found with ID: ${id}`, 404))
        }

        console.log('revirww:', review.user.toString())
        console.log('userr', req.user.id)

         // Check if the review belongs to the user logged in or if the user is an admin
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not authorized to update review`, 401));
    }

         review = await ReviewModel.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
         })
    
        res.status(200).json({
            success: true,
            data: review
        })
    
    
    });


    
//@route DELETE /api/v1/bootcamps/reviews/:id
//@access  Private

const deleteReview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const review = await ReviewModel.findById(id);

    if (!review) {
        return next(new ErrorResponse(`No review found with ID: ${id}`, 404));
    }

    // Check if the review belongs to the user logged in or if the user is an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to delete review`, 401));
    }

    await review.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});


module.exports = {
    getReviews,
    getReviewById,
    postReview,
    updateReview,
    deleteReview
}