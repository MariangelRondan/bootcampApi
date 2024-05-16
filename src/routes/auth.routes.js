const express = require('express')
const { register, login, logOut, getMe, forgotpassword, resetPassword, updateDetails, updatePassword } = require('../controllers/authControllers')
const {protect} = require('../middlewere/auth')

const router = express.Router()

router.post('/register', register)

router.post('/login', login)

router.post('/logout', logOut)

router.get('/me', protect, getMe)

router.put('/updatedetails', protect, updateDetails)

router.put('/updatepassword', protect, updatePassword)

router.post('/forgotpassword', forgotpassword)

router.put('/resetpassword/:resettoken', resetPassword)

module.exports = router;