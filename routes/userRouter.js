var express = require('express');
const userController = require('../controller/userController');
const  {userAuthenticationCheck,userCheck} = require('../middlewares/sessionHandling')
var router = express.Router();
const  {BlockOr} = require('../middlewares/blockCheck')

/* GET home page. */
router.get('/',userAuthenticationCheck,userController.intro ) 
router.get('/home',userCheck,userController.home) 


// GET login page
router.get('/login',userAuthenticationCheck,userController.userlogin)

// GET Signup page
router.get('/signup',userAuthenticationCheck,userController.usersignup)

// POST Signup page
router.post('/signup',userAuthenticationCheck,userController.signupPOST)

// POST login page
router.post('/login',userAuthenticationCheck,userController.loginPOST)

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


router.get('/userProfile',userController.profile)

router.get('/getProducts',userController.getProducts)

router.get('/getdetail/:id',userCheck,BlockOr,userController.getdetail)

// cart management
router.get('/addToCart/:id',userCheck,BlockOr,userController.getAddToCart)


router.get('/getShoppingCart',userCheck,BlockOr,userController.cart)


router.post('/quantity-change',userCheck,BlockOr,userController.incDecQuantity)


router.post('/remove-cart-item/:id',userCheck,BlockOr,userController.removeFromCart)


router.get('/checkout',userCheck,BlockOr,userController.checkout)


router.post('/add-address',userCheck,BlockOr,userController.addAddress)


router.get('/edit-address/:id',userCheck,BlockOr,userController.editAddress)


router.post('/edit-address',userCheck,BlockOr,userController.editAddressPost)


router.post('/place-order',userCheck,BlockOr,userController.placeOrder)


router.get('/order-success',userCheck,BlockOr,userController.orderSuccess)


router.get('/orders',userCheck,BlockOr,userController.orders)


router.get('/Cancel-Order/:id',userCheck,BlockOr,userController.orderCancelling)


router.get('/order-details/:id',userCheck,BlockOr,userController.productOrderDetails)


router.post('/verify-payment',userController.verifypayment)

router.post('/filterCategory',userController.filterByCategory)



module.exports = router;
 