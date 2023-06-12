const couponDB = require('../models/coupenModel')
const OrderDB = require('../models/orderModel')
const CategoryDB = require('../models/categoryModel')
const CartDB = require('../models/cartModel')

const voucherCode=require('voucher-code-generator')

module.exports={
    

    addCouponToDB: (couponData) => {
        return new Promise(async (resolve, reject) => {
            
            const dateString = couponData.couponExpiry;
            const [day, month, year] = dateString.split(/[-/]/);
            const date = new Date(`${year}-${month}-${day}`);
            const convertedDate = date.toISOString();

            let couponCode=voucherCode.generate({
                length: 6,
                count: 3,
                charset: voucherCode.charset("alphabetic")
            });

            console.log("voucher code generator",couponCode[0])
            // console.log(convertedDate)

            const coupon = await new couponDB({
                couponName: couponData.couponName,
                code: couponCode[0],
                discount: couponData.couponAmount,
                expiryDate: convertedDate
            })

            await coupon.save()
                .then(() => {
                    console.log(coupon._id);
                    resolve(coupon._id)
                })
                .catch((error) => {
                    reject(error)
                })
        })
      },

    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            await couponDB.find().lean()
                .then((result) => {
                    resolve(result)
                })
        })
    },

    applyCoupon:(userId, couponCode) => {
        return new Promise(async(resolve,reject) => {
            let coupon = await couponDB.findOne({code :couponCode})
            console.log("couppppppppponnnnn",coupon)

            if(coupon && coupon.isActive == 'Active') {
                if(!coupon.usedBy.includes(userId)) {

                    let cart = await CartDB.findOne({userId:userId})
                    const discount = coupon.discount
                    console.log("cart",cart)

                    cart.totalAmount=cart.totalAmount-discount
                    cart.coupon=couponCode

                    await cart.save()

                    coupon.usedBy.push(userId)
                    await coupon.save()

                    resolve({discount,cart,status:true,message:"coupon added succesfully"})
                }else{
                    resolve({status:false,message:"coupon code already used"})
                }
            }else{
                resolve({status:false,message:"invalid Coupon code"})
            }
        })
    }
}