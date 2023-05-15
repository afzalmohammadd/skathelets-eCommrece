var express = require('express');
const userController = require('../controller/userController');
const  {userAuthenticationCheck} = require('../middlewares/sessionHandling')
var router = express.Router();

/* GET home page. */
router.get('/',userAuthenticationCheck,userController.home ) 
router.get('/home',userController.home) 


// GET login page
router.get('/login',userController.userlogin)

// GET Signup page
router.get('/signup',userController.usersignup)

// POST Signup page
router.post('/signup',userController.signupPOST)

// POST login page
router.post('/login',userController.loginPOST)

// GET Otp form
router.get('/otp-user',userController.otpUser) 

// POST otp form
router.post('/otp-user',userController.otpSending)

// POST otp fil form
router.post('/otp-filll',userController.otpVerifying)

// logout user
router.get('/logout',userController.logoutuser)

// GET forgot password form
router.get('/forgotpass',userController.forgotpass)

// POST forgot password
router.post('/forgotpass',userController.forgotpassPOST)

// POST otp form for forgotPassword
router.post('/otp-forgotPassVer',userController.otpVerifyingforPass)

// POST changing password
router.post('/change-password',userController.changingPassword)


router.get('/getProducts',userController.getProducts)


router.get('/getdetail/:id',userController.getdetail)


// cart management
router.get('/addToCart/:id',userController.getAddToCart)

router.get('/getShoppingCart',userController.getShoppingCart)


module.exports = router;
 