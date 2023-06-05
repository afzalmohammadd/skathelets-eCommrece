var express = require('express');
const admincontroller=require('../controller/adminController');
const adminController = require('../controller/adminController');
const {adminAuthenticationChecking,adminChecking} = require('../middlewares/sessionHandling');
const userController = require('../controller/userController');
var router = express.Router()
const multer = require('../middlewares/multer')
const mongoose= require('mongoose');

// GET login page
router.get('/',adminAuthenticationChecking,admincontroller.adminLogin)

// POST login page
router.post('/loginpost',adminController.loginPost)

//  GET admin home page
router.get('/admin-home',adminChecking,adminController.adminHome)

router.get('/ExcelSalesData',adminChecking,adminController.excelSalesdata)

router.get('/SalesData',adminChecking,adminController.Salesdata)

router.post('/salesReportDate',adminChecking,adminController.salesReportDate)

router.get('/chart',adminChecking,adminController.chart)



// USER MANAGEMENT
router.get('/users-List',adminChecking,adminController.userList)//  GET user-list

router.get('/blockUser/:id',adminChecking,adminController.getblockUser)//  GET block-user

router.get('/unblockUser/:id',adminChecking,adminController.getUnblockUser)//  GET Unblock-user



// CATEGORY MANAGEMENT
router.get('/getCategories',adminChecking,adminController.getCategory) //GET category list

router.post('/createCategory',adminController.addCategory) //Adding Categories POST

router.get('/deleteCategory/:id',adminChecking,adminController.deleteCategories) //Deleting categories POST



// PRODUCT MANAGEMENT
router.get('/getProducts',adminChecking,adminController.getProducts) //GET product-list

router.get('/addproduct',adminChecking,adminController.addProdget)  //GET add-productPAGE

router.post('/add-product', adminChecking, multer.productUpload,adminController.addProduct) //POST adding product

router.get('/editProduct/:id',adminChecking,adminController.geteditProduct) //GET edit page

router.post('/editProduct/:id',adminChecking,multer.productUpload,adminController.editproduct) //POST edit product

router.get('/unlistProduct/:id',adminChecking,admincontroller.unlistProduct) //Unlisting Product

router.get('/listProduct/:id',adminChecking,admincontroller.listProduct) //Unlisting Product


// ORDER DETAILS
router.get('/orders',adminChecking,adminController.listOrder)//Listing order

router.post('/order-status',adminChecking,adminController.changeProductOrderStatus)



module.exports = router;
