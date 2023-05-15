const { response } = require('express')
const userData = require('../models/userModel')
const catogories = require('../models/categoryModel')
const products = require('../models/productModel')
// const mongoose= require('mongoose');

module.exports = {
    findUsers: () => {
        return new Promise(async (resolve, reject) => {
            await userData.find()
                .then((response) => {
                    resolve(response)
                }).catch((error) => {
                    console.log(error);
                    reject(error)
                })
        })
    },
    blockUser: (userId) => {
        try {
            console.log(userId + 'in helper');
            return new Promise(async (resolve, reject) => {
                await userData
                    .updateOne({ _id: userId }, { $set: { blockUser: true } })
                    .then((data) => {
                        resolve()
                    })
            })
        } catch (error) {
            console.log(error);
        }
    },
    Unblock: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await userData
                    .updateOne({ _id: userId }, { $set: { blockUser: false } })
                    .then((data) => {
                        resolve()
                    })
            })
        } catch (error) {
            console.log(error);
        }
    },
    getAllcategory: async () => {
        try {
            let viewCat = await catogories.find({})
            return viewCat
        } catch (error) {
            console.error()
        }
    },
    addingCategories: (catName, catDis) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newCategory = new catogories({
                    name: catName,
                    description: catDis
                });

                newCategory.save().then(() => {
                    console.log("New category created successfully");
                    resolve(newCategory);
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                });

            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
    },
    getAllProducts: () => {
        try {
          return new Promise(async (resolve, reject) => {
            //using lookup for adding category to products
            await products
              .aggregate([
                {
                  $lookup: {
                    from: "categories",
                    localField: "prodCategory",
                    foreignField: "_id",
                    as: "CatDetails",
                  },
                },
              ])
              .then((result) => {
                console.log(result+"founddddddddddddddddddddddddddddddddddddddd");
                resolve(result);
              });
          });
        } catch (error) {
          console.log(error);
        }
      },
    addProduct: async (data,image) => {
        console.log("salllyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
        console.log(data);

         console.log("klklklklklklklklklklklk");
        const newProduct = new products({
            // _id: new mongoose.Types.ObjectId(),
            prodName: data.prodName,
            prodDescription: data.prodDescription,
            prodPrice: data.prodPrice,
            prodQuantity: data.prodQuantity,
            prodSize: data.prodSize,
            prodCategory: data.Category,
            prodImage: image.map(file=>file.filename)
        });
         console.log("PPPPPPPPPPPPPPPPPPP");
         console.log({newProduct});
         console.log("PPPPPPPPPPPPPPPPPPP");
        try {
            const savedProduct = await newProduct.save();
            console.log("New product added successfully");
            return savedProduct;
        } catch (error) {
            console.error(`Error while saving product: ${error.message}`);
            throw new Error(`Error while saving product: ${error.message}`);
        }
    },
    PostEditProduct: async (ProdBody,ProdId,ProdFile)=>{
        console.log("__________+++++++++++++___________");
     
        if(ProdFile){
            updateProduct=await products.findByIdAndUpdate(
                {_id:ProdId},
                {
                    prodName:ProdBody.prodName,
                    prodDescription:ProdBody.prodDescription,
                    prodPrice:ProdBody.prodPrice,
                    prodQuantity:ProdBody.prodQuantity,
                    prodSize:ProdBody.prodSize,
                    prodCategory:ProdBody.Category,
                    prodImage:ProdFile.filename

                }
            )
        }else{
            updateProduct=await products.findByIdAndUpdate(
                {_id:ProdId},
                {
                    prodName:ProdBody.prodName,
                    prodDescription:ProdBody.prodDescription,
                    prodPrice:ProdBody.prodPrice,
                    prodQuantity:ProdBody.prodQuantity,
                    prodSize:ProdBody.prodSize,
                    prodCategory:ProdBody.Category
                   
                }
            )
        }
        return updateProduct  
    }



}