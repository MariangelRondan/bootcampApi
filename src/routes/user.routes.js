const express = require('express')
const {protect, authorize} = require('../middlewere/auth')
const { postUser, getAllUsers,deleteUser, getUserById, updateUser } = require('../controllers/userController')
const advancedResults = require('../middlewere/advancedResults')
const UserModel = require('../models/UserModel')

const router = express.Router()

router.use(protect);
router.use(authorize('admin'));

router.post('/', advancedResults(UserModel), getAllUsers)

router.post('/', postUser)

router.get('/:id', getUserById)

router.put('/:id', updateUser)

router.delete('/:id', deleteUser)



module.exports = router;