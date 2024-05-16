const express = require('express')
const {getBootcamps, getBootcampById, postBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhoto} = require('../controllers/bootcampControllers')
const advancedRersults = require('../middlewere/advancedResults')
const BootcampModel = require('../models/BootcampModel')
const {protect,authorize} = require('../middlewere/auth')

const router =express.Router()

router.get('/', advancedRersults(BootcampModel, 'courses'), getBootcamps)

router.get('/:id', getBootcampById)

router.get('/radius/:zipcode/:distance', getBootcampsInRadius)

router.post('/', protect, authorize('publisher', 'admin'), postBootcamp)


router.put('/:id', protect,  authorize('publisher', 'admin'),  updateBootcamp)


router.delete('/:id', protect,  authorize('publisher', 'admin'),  deleteBootcamp)

router.put('/:id/photo',protect, authorize('publisher', 'admin'),  bootcampPhoto)



//include other resource router
const courseRouter = require('./courses.routes')
const reviewRouter = require('./review.routes')


//Re-route into other resorce routers
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)



module.exports = router;