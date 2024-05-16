const express = require('express')
const {getCourses, getCourseById, postCourse, updateCourse, deleteCourse} = require('../controllers/courseController')
const CourseModel = require('../models/CourseModel')
const advancedResults = require('../middlewere/advancedResults')
const {protect,authorize} = require('../middlewere/auth')


const router =express.Router({mergeParams: true})


router.get('/', advancedResults(CourseModel, { path: 'bootcamp', select: 'name description'}),  getCourses)

router.post('/', protect,  authorize('publisher', 'admin'),  postCourse)

router.get('/:id', getCourseById)

router.patch('/:id', protect, authorize('publisher', 'admin'),  updateCourse)

router.delete('/:id',protect, authorize('publisher', 'admin'),  deleteCourse)


module.exports = router;