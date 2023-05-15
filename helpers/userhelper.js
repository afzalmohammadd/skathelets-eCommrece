const mongoose =require("mongoose")
const users=require("../models/userModel")
const bcrypt=require('bcrypt')
const { blockUser } = require("./adminhelper")
const { ObjectId } = require('mongoose').Types
const cartDB = require('../models/cartModel')

module.exports={
    
    dosignup:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            const isUserExist=await users.findOne({email:userData.email})
             console.log(userData);
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
            console.log(user);
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
                                console.log("login success");
                                resolve(response) 
                                console.log(response+"hai response");                      
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
        //creating a new doc. in cart collection
        //with userId and ProdId[]
        //if the user had a cart then -> push prod ID to prodID[]
        //if no cart then create a NEW ONE
        return new Promise(async (resolve, reject) => {
            try {
                let existingCart = await cartDB.findOne({ userId: new ObjectId(userId) })
                if (existingCart) {
                    console.log('exisiting cart');
                    let exisitingProd = existingCart.products.findIndex(product => product.productId == prodId)
                    if (exisitingProd !== -1) {
                        await cartDB.updateOne(
                            { userId: new ObjectId(userId), 'products.productId': new ObjectId(prodId) },
                            {
                                $inc: { "products.$.quantity": 1 }
                            }
                        )
                        console.log('quantity increased');
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
                        products: [{ productId: new ObjectId(prodId) }]
                    })
                    console.log('product created');
                    resolve()
                }
            } catch (error) {
                console.log(error);
                reject(error)
            }
        })
    }
}