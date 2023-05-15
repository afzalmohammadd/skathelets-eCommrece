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



let check

module.exports = {
    home: async (req, res) => {
        try {
            res.render('shop/home.ejs', {
                layout: "layouts/userLayout",
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
        console.log(req.body);
        userhelper.dosignup(req.body).then((response) => {
            console.log(response);
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
            console.log(response.user)


            if (response.blockUser) {
                console.log("user blocked");
                res.render('shop/login.ejs', {
                    layout: "layouts/userLayout",
                    user: true,
                    blockedUser: true
                })
            } else {
                if (response.loggedin) {
                    console.log("user succesfully loggedin");
                    req.session.user = response.user
                    let Status = response.user
                    console.log(req.session.user);
                    console.log(response.user + "klkl");
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
            console.log("logout succesfull");
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
        console.log("---------")
        console.log(req.body.phone)
        check = req.body
        await users.findOne({ phonenumber: check.phone }).then(async (userData) => {
            if (userData) {
                console.log(userData + "find mobile no from db")
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
        console.log(req.body)
        const mobileNo = check.phone
        const otpFor = req.body.otp
        await twilio.verifyOtp(mobileNo, otpFor)
            .then((status) => {
                if (status) {
                    res.render('shop/passChange', {
                        layout: "layouts/userLayout",
                        user: true
                    })
                    console.log("CCCCCCCPPPPPPPPP");
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
                    console.log(userData.password);

                    const updatedUser = await users.findByIdAndUpdate(userData._id, { password: userData.password }, { new: true });
                    console.log("Password updated successfully:", updatedUser);
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
        console.log(req.body.phone);
        await users.findOne({ phonenumber: find.phone }).then(async (userData) => {
            if (userData) {
                console.log(userData + "find mobile no from db");
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
        console.log("check ver");
        const phone = req.session.mobile
        const otp = req.body.otp
        console.log("this is otp  ", otp);
        await twilio.verifyOtp(phone, otp)
            .then((status) => {
                console.log("--------------------");
                console.log(status);
                console.log("--------------------");

                if (status) {
                    req.session.user = req.session.tempUser
                    loginStatus = req.session.user
                    res.render('shop/home', {
                        layout: "layouts/userLayout",
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

            console.log(viewPoducts);
            if (viewPoducts) {
                res.render('shop/shopping', {
                    layout: "layouts/userLayout",
                    viewCategory,
                    viewPoducts
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
                layout: "layouts/userLayout"
            })
        }

    },
    getdetail: async (req, res) => {
        try {
            console.log("shop detail")
            let viewproduct = await products.findById({ _id: req.params.id })

            if (viewproduct) {
                res.render('shop/detail', {
                    layout: "layouts/userLayout",
                    viewproduct
                })
            } else {
                res.render('shop/shopping', {
                    layout: "layouts/userLayout"
                })

            }
        } catch (error) {
            console.log(error)
            res.render('shop/shopping', {
                layout: "layouts/userLayout"
            })
        }
    },
    //adding to the cart
    getAddToCart: (req, res) => {

        try {
            let prodId = req.params.id
            let userID = req.session.user._id

            console.log('product id : ' + prodId + " " + "user id : " + userID);
            console.log('api called');
            userhelper.addToCart(prodId, userID)
                .then((response) => {
                    console.log('got the response for adding to  cart');
                    res.json({ status: true })
                })
        } catch (error) {
            console.log(error);
        }
    },
    getShoppingCart: async (req, res) => {
        let userId = req.session.user._id;

        try {
            const cart = await cartDB.findOne({ userId }).populate('products.productId');

            if (!cart) {
                console.log('Cart not found');
                return res.render('shop/cart', {
                    layout: 'layouts/userLayout',
                    cart: [] // Pass an empty array if cart is not found
                });
            }

            console.log("Cart found:", cart) 

            res.render('shop/cart', {
                layout: 'layouts/userLayout',
                cart: cart.products
            });
        } catch (error) {
            console.error('Error finding cart:', error)
            
        }
    }


}