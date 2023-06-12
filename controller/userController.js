const { response } = require('express')
const userhelper = require('../helpers/userhelper')
const twilio = require('../api/twilio')
const users = require("../models/userModel")
const { Twilio } = require('twilio')
const bcrypt = require('bcrypt')
const { blockUser } = require('../helpers/adminhelper')
const products = require("../models/productModel")
const categories = require("../models/categoryModel")
const cartDB = require('../models/cartModel')
const orderDB = require('../models/orderModel')
const addressDB = require('../models/addressModel')
const addressHelper = require('../helpers/addressHelper')
const orderhelper = require('../helpers/orderhelper')
const ObjectId = require('mongoose').Types.ObjectId

const Razorpay = require('razorpay');
const { log } = require('console')
const coupenHelper = require('../helpers/coupenHelper')

var instance = new Razorpay({
    key_id: 'rzp_test_uqjS5a2hmaYBoQ',
    key_secret: 'LmAP75P7IfisHinnntdOcN2f',
});

let Status
let check
let loginStatus
let cartCount
let loginUser
let loginOrlogout

module.exports = {

    intro: async (req, res) => {
        if (req.session.user) {
            res.render('shop/home.ejs', {
                layout: "layouts/userLayout",
            })
        } else {
            res.render('shop/home.ejs', {
                layout: "layouts/userLayout",
            })
        }
    },
    home: async (req, res) => {
        try {
            Status = req.session.user
            res.render('shop/home.ejs', {
                layout: "layouts/userLayout",
                Status
            })
        } catch (err) {
            console.error(err)
        }
    },
    userlogin: async (req, res) => {
        try {

            res.render('shop/login.ejs', {
                layout: "layouts/userLayout",
                user: true,
            })
        } catch (err) {
            console.error(err)
        }
    },
    usersignup: async (req, res) => {
        try {
            res.render('shop/signup.ejs', {
                layout: "layouts/userLayout",
                user: true
            })
        } catch (err) {
            console.error(err)
        }
    },
    signupPOST: async (req, res) => {
        let response = {}
        // console.log(req.body);
        userhelper.dosignup(req.body).then((response) => {
            // console.log(response);
            if (!response.isUserExist) {
                res.render('shop/home', {
                    layout: "layouts/userLayout",
                })
            } else {
                exist = true
                response.existing
                res.render('shop/signup', {
                    layout: "layouts/userLayout",
                    user: true,
                    existing: true

                })
            }
        })
    },
    loginPOST: async (req, res) => {
        console.log(req.body);

        userhelper.dologin(req.body).then((response) => {
            // console.log(response.user)


            if (response.blockUser) {
                // console.log("user blocked")
                res.render('shop/login.ejs', {
                    layout: "layouts/userLayout",
                    user: true,
                    blockedUser: true
                })
            } else {
                if (response.loggedin) {
                    // console.log("user succesfully loggedin");
                    req.session.user = response.user
                    // console.log("aaaaaaaaaffffffffffffff", req.session.user);
                    Status = response.user
                    loginStatus = true
                    loginUser = req.session.user
                    // console.log(req.session.user);
                    // console.log(response.user + "klkl");
                    res.render('shop/home', {
                        layout: "layouts/userLayout",
                        Status
                    });

                } else {
                    res.render('shop/login.ejs', {
                        layout: "layouts/userLayout",
                        user: true
                    })
                }
            }
        })

    },

    logoutuser: (req, res) => {
        try {
            req.session.user = false
            loginStatus = false
            // console.log("logout succesfull");
            res.render('shop/home', {
                layout: "layouts/userLayout",

            })
        } catch (error) {
            console.log(error)
            console.log("unsuccesfull logout")
        }
    },
    forgotpass: (req, res) => {
        try {
            res.render('shop/forgotpass', {
                layout: "layouts/userLayout",
                user: true
            })
        } catch (error) {
            console.log(error);
        }
    },
    forgotpassPOST: async (req, res) => {
        // console.log("---------")
        // console.log(req.body.phone)
        check = req.body
        await users.findOne({ phonenumber: check.phone }).then(async (userData) => {
            if (userData) {
                // console.log(userData + "find mobile no from db")
                const alreadyExisted = userData
                await twilio.sentOtp(check.phone)
                    .then((result) => {
                        res.render('shop/otpVer-forgotpass', {
                            layout: "layouts/userLayout",
                            user: true
                        })
                    })

            } else {
                console.log("mobile no not found");
                res.render("shop/forgotpass", {
                    layout: "layouts/userLayout",
                    user: true
                })
            }
        })
    },
    otpVerifyingforPass: async (req, res) => {
        // console.log(req.body)
        const mobileNo = check.phone
        const otpFor = req.body.otp
        await twilio.verifyOtp(mobileNo, otpFor)
            .then((status) => {
                if (status) {
                    res.render('shop/passChange', {
                        layout: "layouts/userLayout",
                        user: true
                    })
                    // console.log("CCCCCCCPPPPPPPPP");
                } else {
                    res.redirect('/shop/forgotpass', {
                        layout: "layouts/userLayout",
                        user: true
                    })
                }
            }).catch((error) => {
                res.render('/shop/forgotpass', {
                    layout: "layouts/userLayout",
                    user: true
                })
                console.log("error");
                console.log(error);
            })

    },
    changingPassword: async (req, res) => {
        const newPassword = req.body.newPassword
        const confirmPassword = req.body.confirmPassword
        await users.findOne({ phonenumber: check.phone }).then(async (userData) => {
            try {
                if (userData) {
                    userData.password = await bcrypt.hash(newPassword, 10);
                    // console.log(userData.password);

                    const updatedUser = await users.findByIdAndUpdate(userData._id, { password: userData.password }, { new: true });
                    // console.log("Password updated successfully:", updatedUser);
                    res.render('shop/login', {
                        layout: "layouts/userLayout",
                        user: true
                    });
                } else {
                    console.log("password updation unsuccessful");
                    res.render('/shop/passChange', {
                        layout: "layouts/userLayout",
                        user: true
                    });
                }
            } catch (error) {
                console.error("Error updating password:", error);
                res.render('shop/passChange', {
                    layout: "layouts/userLayout",
                    user: true
                });
            }

        })

    },
    // otp login page
    otpUser: (req, res) => {
        res.render('shop/otp-user', {
            layout: "layouts/userLayout",
            user: true
        })
    },

    // otp sending in login process
    otpSending: async (req, res) => {
        const find = req.body
        req.session.mobile = req.body.phone
        // console.log(req.body.phone);
        await users.findOne({ phonenumber: find.phone }).then(async (userData) => {
            if (userData) {
                // console.log(userData + "find mobile no from db");
                req.session.tempUser = userData
                await twilio.sentOtp(find.phone)
                    .then((result) => {
                        res.render('shop/otp-fill', {
                            layout: "layouts/userLayout",
                            user: true
                        })
                    })
            } else {

                console.log("mobile not found");
                res.render('shop/otp-user', {
                    layout: "layouts/userLayout",
                    user: true
                })
            }

        })
            .catch((error) => {
                console.log(error + "ERROR");
                res.redirect('/login')
            })
    },
    // otp verifying in login process
    otpVerifying: async (req, res) => {
        // console.log("check ver");
        const phone = req.session.mobile
        const otp = req.body.otp
        // console.log("this is otp  ", otp);
        await twilio.verifyOtp(phone, otp)
            .then((status) => {
                // console.log("--------------------");
                // console.log(status);
                // console.log("--------------------");

                if (status) {
                    req.session.user = req.session.tempUser
                    loginStatus = req.session.user
                    res.render('shop/home', {
                        layout: "layouts/userLayout",
                        Status
                    })
                } else {
                    console.log("invalid otp")
                    res.redirect('/shop/otp-user')
                }
            }).catch((error) => {
                res.redirect('/shop/otp-user')
                console.log("error");
            })

    },
    getProducts: async (req, res) => {
        try {
            let viewCategory = await categories.find({})
            let viewPoducts = await products.find({ unList: false });

            // console.log(viewPoducts);
            if (viewPoducts) {
                res.render('shop/shopping', {
                    layout: "layouts/userLayout",
                    viewCategory,
                    viewPoducts,
                    Status
                })
            } else {
                res.render('shop/login', {
                    layout: "layouts/userLayout",
                    user: true
                })
            }

        } catch (error) {
            console.log(error);
            res.render('shop/shopping', {
                layout: "layouts/userLayout",
                Status
            })
        }

    },
    getdetail: async (req, res) => {
        try {
            // console.log("shop detail")
            let viewproduct = await products.findById({ _id: req.params.id })

            if (viewproduct) {
                res.render('shop/detail', {
                    layout: "layouts/userLayout",
                    viewproduct,
                    Status
                })
            } else {
                res.render('shop/shopping', {
                    layout: "layouts/userLayout",
                    Status
                })

            }
        } catch (error) {
            console.log(error)
            res.render('shop/shopping', {
                layout: "layouts/userLayout",
                Status
            })
        }
    },
    //adding to the cart
    getAddToCart: (req, res) => {

        try {
            let prodId = req.params.id
            let userID = req.session.user._id

            // console.log('product id : ' + prodId + " " + "user id : " + userID);
            // console.log('api called');
            userhelper.addToCart(prodId, userID)
                .then((response) => {
                    // console.log('got the response for adding to  cart');
                    res.redirect('/getShoppingCart')
                })
        } catch (error) {
            console.log(error);
        }
    },

    cart: async (req, res) => {
        // console.log("in cart");
        try {
            let user = req.session.user;
            let cartItems = await userhelper.getAllCartItems(user._id)
            let cartCount = await userhelper.getCartCount(user._id)
            let totalandSubTotal = await userhelper.totalSubtotal(user._id, cartItems)


            // console.log("cartItems");
            // console.log(totalandSubTotal);
            // console.log("cartItems");

            res.render('shop/cart', {
                layout: "layouts/userLayout",
                loginStatus, cartItems, cartCount, totalAmount: totalandSubTotal, Status
            })
        } catch (error) {
            console.log(error);
        }
    },
    incDecQuantity: async (req, res) => {
        try {
            let obj = {}
            let user = req.session.user
            let productId = req.body.productId;
            let quantity = req.body.quantity;

            // console.log("user",user)
            // console.log("productId",productId)
            // console.log("quantity",quantity)
            obj.quantity = await userhelper.incDecProductQuantity(user._id, productId, quantity)

            let cartItems = await userhelper.getAllCartItems(user._id)
            obj.totalAmount = await userhelper.totalSubtotal(user._id, cartItems)
            obj.totalAmount = obj.totalAmount.toLocaleString('en-in', { style: 'currency', currency: 'INR' })
            // console.log(obj);
            res.status(202).json({ message: obj })
            // .catch((error)=>{
            //     res.json({error:true,message:"Quantity must be between 1 - 10"})
            // })
        } catch (error) {
            console.log(error);
        }
    },
    removeFromCart: (req, res) => {
        try {
            let cartId = req.body.cartId;
            let productId = req.params.id
            // console.log("hello");
            // console.log(productId);
            // console.log(cartId);
            // console.log("hello");

            userhelper.removeAnItemFromCart(cartId, productId)
                .then((response) => {
                    // console.log("sucessfully deleted");
                    res.status(202).json({ message: "sucessfully item removed" })
                })
        } catch (error) {
            console.log(error);
        }
    },
    checkout: async (req, res) => {
        try {
            const user = req.session.user;

            let cartItems = await userhelper.getAllCartItems(user._id);

            let totalAmount = await userhelper.totalSubtotal(user._id, cartItems);
            totalAmount = totalAmount.toLocaleString('en-in', { style: 'currency', currency: 'INR' })
            const userAddress = await addressHelper.findAddresses(user._id)
            // console.log("[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]")
            // console.log(userAddress)
            // console.log("[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]")

            // console.log("vvvvvvvvvvvvvvvvvvv");
            // console.log(cartItems);
            // for (let i = 0; i < cartItems.length; i++) {
            //     if (cartItems[i].product) {
            //         cartItems[i].product.prodPrice = cartItems[i].product.product_price.toLocaleString('en-in', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
            //       }else{
            //         console.log("nooooooooooo");
            //       }


            // }
            // console.log(loginStatus);
            // console.log("AAAAAAAAAAAAAAAAAAAAAA");

            res.render('shop/checkout', { layout: "layouts/userLayout", loginUser, cartCount, user, totalAmount: totalAmount, cartItems, address: userAddress, Status })
        } catch (error) {
            console.log(error);
        }
    },
    addAddress: async (req, res) => {
        try {
            // console.log("trying to add address");
            // console.log("-------------------------------");
            // console.log(req.body);
            // console.log("-------------------------------");
            addressHelper.addAddress(req.body)
                .then((response) => {
                    // console.log(response)
                    res.status(202).json({ message: "address added successfully" })

                })

        } catch (error) {
            console.log(error);
        }

        // res.render('user/mobile')
    },

    editAddress: async (req, res) => {
        try {
            // console.log("controller", req.params.id);
            let address = await addressHelper.getAnAddress(req.params.id);
            // console.log("controller", address);
            res.json({ address: address })
        } catch (error) {
            console.log(error);
        }
    },
    editAddressPost: async (req, res) => {
        try {

            let addressUpdated = await addressHelper.editAnAddress(req.body);
            // console.log(addressUpdated);
            res.json({ message: "address updated" })

        } catch (error) {
            console.log(error);
        }

    },
    placeOrder: async (req, res) => {
        try {
            let userId = req.body.userId;
            let cartItems = await userhelper.getAllCartItems(userId);

            if (!cartItems.length) {
                return res.json({ error: true, message: "Please add items to cart before checkout" });
            }

            if (req.body.addressSelected === undefined) {
                return res.json({ error: true, message: "Please Choose Address" });
            }

            if (req.body.payment === undefined) {
                return res.json({ error: true, message: "Please Choose Payment Method" });
            }

            let totalAmount = await userhelper.totalamount(userId);


            if (req.body.payment === 'COD') {
                await orderhelper.orderPlacing(req.body, totalAmount, cartItems);
                await userhelper.decreaseStock(cartItems);
                await userhelper.clearCart(userId);
                const cartCount = await userhelper.getCartCount(userId);
                res.status(202).json({ message: "Purchase Done", payment: req.body.payment });
            } else if (req.body.payment === 'onlinePayment') {
                const orderId = await orderhelper.orderGetting(req.body, totalAmount, cartItems);
                await userhelper.decreaseStock(cartItems);
                await userhelper.clearCart(userId);
                // console.log("inside online payment");
                // console.log(orderId);
                try {
                    const response = await orderhelper.generateRazorpay(orderId, totalAmount);
                    // console.log("sally");
                    // console.log(response, "555555555555555555555555555555555555555555555555555555555555555555555555555555555");
                    res.status(200).json({ response, payment: req.body.payment });
                } catch (error) {
                    console.log(error);
                    res.status(500).json({ status: false, error: 'An error occurred' });
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: true, message: 'An error occurred' });
        }
    },
    orderSuccess: (req, res) => {
        try {
            // console.log("this is order success function");
            res.render('shop/order-success', {
                layout: "layouts/userLayout",
                loginStatus,
                Status
            })
        } catch (error) {
            console.log(error);
        }
    },
    orders: async (req, res) => {
        try {
            const user = req.session.user
            let userOrderDetails = await orderhelper.getAllOrderDetailsOfAUser(user._id)
            // console.log("userController here ", userOrderDetails)


            // console.log("orders", userOrderDetails)
            // console.log("order-user   ++++___++")
            res.render('shop/orders-user', {
                layout: "layouts/userLayout",
                loginStatus,
                userOrderDetails,
                cartCount,
                Status
            })
        } catch (error) {
            console.log(error);
        }
    },
    productOrderDetails: async (req, res) => {
        try {
            const orderId = req.params.id
            let orderdetails = await orderhelper.getOrderedUserDetailsAndAddress(orderId); //got user details

            let productDetails = await orderhelper.getOrderedProductsDetails(orderId); //got ordered products details

            console.log("inside productOrderDetails");
            
            
            res.render('shop/order-details-user', {
                layout: "layouts/userLayout",
                user:true,
                orderdetails, productDetails, loginStatus, Status
            })
        } catch (error) {

        }
    },
    verifypayment: async (req, res) => {

        try {
            // console.log("inside verifypayment");
            let details = req.body;
            // console.log(details, "++++++++++++++++++++++"); // Check the received details

            const crypto = require("crypto");
            let hmac = crypto.createHmac("sha256", "LmAP75P7IfisHinnntdOcN2f");
            hmac.update(details["payment[razorpay_order_id]"] + "|" + details["payment[razorpay_payment_id]"]);
            hmac = hmac.digest("hex");
            let orderResponse = details["order[response][receipt]"];
            // console.log(orderResponse);
            let orderObjId = new ObjectId(orderResponse);

            // console.log(details["payment"]);

            if (hmac === details["payment[razorpay_signature]"]) {
                let user = req.session.user;

                await userhelper.clearCart(user._id);

                await orderDB.updateOne(
                    { _id: orderObjId },
                    {
                        $set: {
                            orderStatus: "placed"
                        }
                    }
                );

                // console.log("Payment is successful RazorPay");
                res.json({ status: true });
            } else {
                await orderDB.updateOne(
                    { _id: orderObjId },
                    {
                        $set: {
                            orderStatus: "failed"
                        }
                    }
                );

                // console.log("Payment is failed");
                res.json({ status: false, errMsg: "" });
            }
        } catch (error) {
            console.log(error, "error");
            res.status(500).send("Internal server error");
        }
    },
    profile: async (req, res) => {
        try {
            // console.log("in profile");
            const user = req.session.user._id
            const userData = await users.findById(user)
            const userAddress = await addressHelper.findAddresses(user)
            // console.log(userData,"ddddddddddddssssssssssssssss");

            res.render('shop/UserAccount', {
                layout: "layouts/userLayout",
                userData,
                Status,
                address: userAddress
            })
        } catch (error) {
            console.error()
        }
    },
    filterByCategory:async(req,res)=>{
        try{
            let category=req.body.categoryId
            // console.log("inside FILTER-BY-CATEGORY");
            // console.log(category);
            const filteredProd = await products.find({ prodCategory: category })
            // console.log("Filtered By Category",filteredProd)

            res.status(200).json({ products: filteredProd })
        }catch(error){
            console.log(error);
        }
    },
    applyCoupon:async(req,res)=>{
        try{
            const  user=req.session.user
            const {totalAmount,couponCode}=req.body
            const response =await coupenHelper.applyCoupon(user._id,couponCode)

            res.status(202).json(response)
        }catch(error){

        }
    },

    cancelOrder:async(req,res) =>{

        const userId = req.body.userId;
        const orderId = req.body.orderId;

        try{
            const cancelled = await orderhelper.cancelorder(orderId)
            res.status(200).json({ isCancelled: true, message: "order canceled successfully" })
        }catch(error){
            console.log(error);
        }
    },

    returnOrder:async(req,res) =>{
        const userId = req.body.userId
        const orderId = req.body.orderId

        try{
            const returnOrder = await orderhelper.orderReturn(userId,orderId)
            res.status(200).json({isreturned: 'return pending', message:"user is returning the order"})
        }catch(error){
            console.log(error);
        }
    }
    
    
}