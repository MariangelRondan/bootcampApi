const asyncHandler = require("../middlewere/async");
const BootcampModel = require("../models/BootcampModel");
const CourseModel = require("../models/CourseModel");
const ErrorResponse = require("../utils/errorResponses");

//route -> GET api/v1/courses || api/v1/bootcamps/:bootcampId/courses

const getCourses = asyncHandler(async(req, res, next) => {
    const {bootcampId} = req.params;
  

    if(bootcampId){
        const courses = await CourseModel.find({bootcamp: bootcampId})
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        // query = CourseModel.find().populate('bootcamp'); //trae al bootcamp, no solo al id
        // query = CourseModel.find().populate({ //trae solo los datos en el select
        //     path: 'bootcamp',
        //     select: 'name description'
        // });
        res.status(200).json(res.advancedResults)//los resultados que da el middlewere
    }

})


const getCourseById = asyncHandler(async(req, res, next)=> {
    const {id} = req.params;
    const course = await CourseModel.findById(id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${id}`), 404)
    }

    res.status(200).json({
        success: true,
        data: course
    })


})


//route -> POST /api/v1/bootcamps/:bootcampId/courses

const postCourse = asyncHandler(async(req, res, next)=> {
    const {bootcampId} = req.params;
  
    req.body.bootcamp = bootcampId; //asigno el id del params al body del bootcamp, que es la prop de course.
    req.body.user = req.user.id;

    const bootcamp = await BootcampModel.findById(bootcampId)

    if(!bootcamp){
        return next(new ErrorResponse(`No course with the id of ${bootcampId}`), 404)
    }

      //Make sure the user logged in is the bootcamp owner. Paso bootcamp.user a string pq es un objectId
      if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID: ${req.user.id} is not authorized to add a course to Bootcamp: ${bootcamp._id}`, 401))
    }

    const course = await CourseModel.create(req.body)

    res.status(200).json({
        success: true,
        data: course
    })

})

const updateCourse = asyncHandler(async(req, res, next)=> {
    const {id}= req.params;

    let course= await CourseModel.findById(id);

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${id}`), 404)
    }

    //Make sure the user logged in is the bootcamp owner. Paso bootcamp.user a string pq es un objectId
     if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID: ${req.user.id} is not authorized to update the course: ${course._id}`, 401))
    }

    course = await CourseModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: course
    })

});


const deleteCourse = asyncHandler(async(req, res, next) => {
    

    let course = await CourseModel.findById(req.params.id);


    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
    } 

    
    //Make sure the user logged in is the bootcamp owner. Paso bootcamp.user a string pq es un objectId
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID: ${req.user.id} is not authorized to delete the course: ${course._id}`, 401))
    }
     await course.deleteOne()
   


    res.status(200).json({
        success: true,
        data: {}
    });
});





module.exports = {
    getCourses,
    getCourseById,
    postCourse,
    updateCourse,
    deleteCourse
}