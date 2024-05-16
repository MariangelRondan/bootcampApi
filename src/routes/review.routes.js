const express = require('express')
const ReviewsModel = require('../models/ReviewModel')
const advancedResults = require('../middlewere/advancedResults')
const {protect,authorize} = require('../middlewere/auth')
const { getReviews,getReviewById,postReview, updateReview,deleteReview } = require('../controllers/reviewController')


const router = express.Router({mergeParams: true})


router.get('/', advancedResults(ReviewsModel, { path: 'bootcamp', select: 'name description'}),  getReviews)

router.post('/', protect,  authorize('user', 'admin'),  postReview )

router.get('/:id', getReviewById)

router.put('/:id', protect, authorize('user', 'admin'),  updateReview)

router.delete('/:id', protect, authorize('user', 'admin'), deleteReview)

// router.delete('/:id',protect, authorize('publisher', 'admin'),  deleteCourse)


module.exports = router;