const mongoose =require("mongoose")
const users=require("../models/userModel")
const bcrypt=require('bcrypt')
const { blockUser } = require("./adminhelper")
const { ObjectId } = require('mongoose').Types
const cartDB = require('../models/cartModel')
const products = require('../models/productModel')
const orderDB = require('../models/orderModel')

module.exports={
    
    dosignup:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            const isUserExist=await users.findOne({email:userData.email})
            //  console.log(userData);
            if(!isUserExist){
                userData.password=await bcrypt.hash(userData.password,10)

                users.create({
                    username:userData.name,
                    email:userData.email,
                    password:userData.password,
                    phonenumber:userData.phone,
                    isActive:true
                }).then((data)=>{
                    resolve(data)
                }).catch((error)=>{
                    reject(error)
                })
            }else{
                resolve({isUserExist:true},)
            }
        })
    },
    dologin:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            let user=await users.findOne({email:userData.email})
            // console.log(user);
            let response={}
            if(user){
                bcrypt.compare(userData.password,user.password).then((result)=>{
                
                        if(user.blockUser){
                            response.blockUser=true
                            resolve(response)
                        }else{
                            if(result){
                                response.user=user
                                response.loggedin=true
                                // console.log("login success");
                                resolve(response) 
                                // console.log(response+"hai response");                      
                            }else{
                                resolve({loggedin:false})
                                console.log("login failed");
                            }
                        }
                    
                    
                })
            }else{
                resolve({status:false})
                console.log("login failed");
            }
        })
    },

    // CART MANAGEMENT
    addToCart: (prodId, userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            let existingCart = await cartDB.findOne({ userId: new ObjectId(userId) })
            if (existingCart) {
            //   console.log('existing cart');
              let existingProd = existingCart.products.findIndex(product => product.productId == prodId)
              if (existingProd !== -1) {
                await cartDB.updateOne(
                  { userId: new ObjectId(userId), 'products.productId': new ObjectId(prodId) },
                  {
                    $inc: { "products.$.quantity": 1 }
                  }
                )
                // console.log('quantity increased');
              } else {
                await cartDB.updateOne(
                  { userId: new ObjectId(userId) },
                  {
                    $push: { products: { productId: new ObjectId(prodId) } }
                  }
                )
              }
              resolve()
            } else {
              await cartDB.create({
                userId: new ObjectId(userId),
                products: [{ productId: new ObjectId(prodId) }],
                totalAmount: 0  // Add the totalAmount field with a default value of 0
              })
            //   console.log('cart created');
              resolve()
            }
          } catch (error) {
            console.log(error);
            reject(error)
          }
        })
      },
    getAllCartItems: (userId) => {
        return new Promise(async (resolve, reject) => {
            
            let userCartItems = await cartDB.aggregate([
                {
                    $match: { userId: new ObjectId(userId) }
                },
                {
                    $unwind: "$products"
                },
                {
                    $project: {
                        item: "$products.productId",
                        quantity: "$products.quantity"
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }
            ]);


            // console.log("--------------------------------------");
            // console.log(userCartItems);
            // console.log("--------------------------------------");

            resolve(userCartItems);

        });

    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await cartDB.findOne({ userId: userId })
            if (cart) {
                count = cart.products.length;
            } else {
                count = 0
            }
            resolve(count)
        })
    },
    incDecProductQuantity: (userId, productId, quantity) => {
        return new Promise(async (resolve, reject) => {
            const cart = await cartDB.findOne({ userId: userId });
            // console.log(cart);   //got a big output and solved
            // console.log(",,,,,,,,,,,,,,,,,,,,,");
            // console.log(productId);
            // console.log(",,,,,,,,,,,,,,,,,,,,,");
            const product = cart.products.find((items) => {
                return items.productId.toString() == productId
            }
            );

            let newQuantity = product.quantity + parseInt(quantity);

            if (newQuantity < 1 || newQuantity > 10) {
                newQuantity = 1;
            }

            product.quantity = newQuantity;
            await cart.save();
            resolve(newQuantity)

        })
    },
    totalSubtotal: (userId, cartItems) => {
        return new Promise(async (resolve, reject) => {
            let cart = await cartDB.findOne({ userId: userId })
            // console.log(cart);
            let total = 0;
            if (cart) {

                if (cartItems.length) {
                    for (let i = 0; i < cartItems.length; i++) {
                        total = total + (cartItems[i].quantity * cartItems[i].product.prodPrice);
                    }
                }
                cart.totalAmount = total;
                await cart.save()
                // console.log(total);
                resolve(total)

                // console.log("cartItemscartItemscartItems");
                // console.log(cartItems);
                // console.log("cartItemscartItemscartItems");
            } else {
                resolve(total)
            }
        })
    },
    removeAnItemFromCart: (cartId, productId) => {
        return new Promise(async (resolve, reject) => {
            cartDB.updateOne({ _id: cartId },
                {
                    $pull: { products: { productId: productId } }
                }
            ).then((result) => {
                resolve(result)
            })
        })
    },
    decreaseStock:(cartItems)=>{
        return new Promise(async (resolve,reject)=>{
            // console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{");
            // console.log("decreaseStock0",cartItems);
            for(let i=0;i<cartItems.length;i++){
                let product = await products.findById({_id:cartItems[i].item});
                // console.log("decreaseStock1",product);
                const isProductAvailableInStock=(product.prodQuantity-cartItems[i].quantity)>0 ? true : false;
                if(isProductAvailableInStock){
                    product.prodQuantity=product.prodQuantity-cartItems[i].quantity;
                }
                // else{

                // }
                await product.save();
                // console.log("decreaseStock2",product);
            }
            // console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{");
            resolve(true)
        })
    },
    totalamount: (userId) => {
        return new Promise(async (resolve, reject) => {
          const cart = await cartDB.findOne({ userId: userId });
        //   console.log(cart);
          if (cart !== null) {
            resolve(cart.totalAmount);
            // console.log("cart found ++++++++++++++++++++++++++++");
          } else {
            // Handle the case when cart is null
            reject(new Error("Cart not found for the user"));
          }
        });
      },
      
    clearCart: (userId) => {
        return new Promise(async (resolve, reject) => {
            await cartDB.findOneAndUpdate(
                { userId: userId },
                { $set: { products: [] } }, 
                { new: true })

                .then((result)=>{
                    resolve(result)
                })
        })

    }

 
}