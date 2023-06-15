const addressSchema = require('../models/addressModel')
const orderSchema = require('../models/orderModel');
const walletHelper = require('../helpers/walletHelper')

const ObjectId = require('mongoose').Types.ObjectId;
const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'rzp_test_uqjS5a2hmaYBoQ',
    key_secret: 'LmAP75P7IfisHinnntdOcN2f',
});


function orderDate() {
    const date = new Date();
    console.log(date);

    return date
}

module.exports = {
    orderPlacing: (order, totalAmount, cartItems) => {
        return new Promise(async (resolve, reject) => {
            let status = order.payment == 'COD' ? 'confirmed' : 'pending';
            let date = orderDate();
            let userId = order.userId;
            let couponcode = order.couponCode
            // let address= await addressSchema.findById({_id:order.addressSelected})
            let paymentMethod = order.payment;
            let addressId = order.addressSelected;
            let orderedItems = cartItems
            // console.log("orderedItems", orderedItems)

            let orderedPrices = []

            for (let i = 0; i < orderedItems.length; i++) {
                 orderedPrices.push(orderedItems[i].product.prodPrice) 

                console.log(orderedPrices,"+++++++++++++++++++++++");
                
            }

            // console.log("orderedItems orderHelper ", orderedItems)
            let ordered = new orderSchema({
                user: userId,
                address: addressId,
                orderDate: date,
                totalAmount: totalAmount,
                coupon : couponcode,
                paymentMethod: paymentMethod,
                orderStatus: status,
                orderedItems: orderedItems,
                orderedPrice: orderedPrices,
                returnReason:""
            })
            await ordered.save();
            // console.log("upoladed to dbbbbbbbbbbbbbbb")
            resolve(ordered)
        })
    },
    getAllOrderDetailsOfAUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            const userOrderDetails = await orderSchema.aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $lookup: {
                        from: 'addresses',
                        localField: 'address',
                        foreignField: '_id',
                        as: 'addressLookedup'
                    }
                },
                {
                    $sort: { _id: -1 } // Sort by _id field in descending order
                }
            ]);

            // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            // console.log("This is aggregation result", userOrderDetails);
            // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            resolve(userOrderDetails);
        });
    },
    getOrderedUserDetailsAndAddress: (orderId) => {
        return new Promise(async (resolve, reject) => {
            await orderSchema.aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                },

                {
                    $lookup: {
                        from: 'addresses',
                        localField: 'address',
                        foreignField: '_id',
                        as: 'userAddress'
                    }
                },
                {
                    $project: {
                        user: 1,
                        orderDate:1,
                        orderStatus:1,
                        totalAmount: 1,
                        paymentMethod: 1,
                        orderedPrice:1,
                        returnReason:1,

                        address: {
                            $arrayElemAt: ['$userAddress', 0]
                        }
                    }
                },
            ]).then((result) => {
                resolve(result[0])
            })
        })
    },
    getOrderedProductsDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            await orderSchema.aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                },
                {
                    $unwind: '$orderedItems'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'orderedItems.product',
                        foreignField: '_id',
                        as: 'orderedProduct'
                    }
                },
                {
                    $unwind: '$orderedProduct'
                }
            ]).then((result) => {
                // console.log("orders", result);
                resolve(result)
            })
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            await orderSchema.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $sort: { _id: -1 }  // Sort by _id field in descending order
                }
            ])
                .then((result) => {
                    // console.log(result);
                    resolve(result)
                })
        })
    },
    changeOrderStatus: async (changeOrderstatus, orderId) => {

        try {
            let orderStatusChanged = await orderSchema.findOneAndUpdate(
                { _id: orderId },
                { $set: { orderStatus: changeOrderstatus } },
                { new: true } // Add this option to return the updated document
            );

            if (orderStatusChanged) {
                return { error: false, message: 'order status updated' }

            } else {
                return { error: true, message: 'something wrong ' }

            }
        } catch (error) {
            console.error(error);
            reject(error);
        }

    },
    orderGetting: (order, totalAmount, cartItems) => {
        return new Promise(async (resolve, reject) => {
            let status = order.payment == 'onlinePayment' ? 'confirmed' : 'pending';
            let date = orderDate();
            let userId = order.userId;
            // let address= await addressSchema.findById({_id:order.addressSelected});
            let paymentMethod = order.payment;
            let addressId = order.addressSelected;
            let orderedItems = cartItems
            // console.log("orderedItems", orderedItems);

            // console.log("orderedItems orderHelper ", orderedItems);
            let ordered = new orderSchema({
                user: userId,
                address: addressId,
                orderDate: date,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                orderStatus: status,
                orderedItems: orderedItems
            })
            await ordered.save();
            // console.log("upoladed to dbbbbbbbbbbbbbbb");
            resolve(ordered._id);
        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var instance = new Razorpay({ key_id: 'rzp_test_uqjS5a2hmaYBoQ', key_secret: 'LmAP75P7IfisHinnntdOcN2f' });
            // console.log("inside razorpay");
            instance.orders.create(
              {
                amount: total*100,
                currency: "INR",
                receipt: orderId.toString()
              },
              (error, order) => {
                if (order) {
                  
                //   console.log("order+++++razorpay", order);
                  resolve(order)
                } else {
                    // console.log("error++++++", error);
                    reject(error);
                }
              }
            );
          })
          
        .catch((error) => {
          console.log("Promise rejected with error:", error);
          // Handle the error appropriately (e.g., throw an exception, log an error, etc.)
          throw error;
        });
      },
      getAllDeliveredOrders: () => {
        return new Promise(async (resolve, reject) => {
          await orderSchema.aggregate([
            {
                $match: { orderStatus: "delivered" }
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'userDetails'
                }
              },
              {
                $sort: { _id: -1 } // Add $sort stage to sort by _id field in descending order
              }
            ])
          .then((result) => {
            // console.log("inside orderhelper ",result);
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
        });
      },
      getDeliveredOrdersbyDate:(startDate,endDate)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                await orderSchema.find({orderDate:{$gte:startDate,$lte:endDate},orderStatus:"delivered"}).lean()
                .then((result)=>{
                    // console.log("orders in the provided date",result)
                    resolve(result)
                })
            }catch(error){
                console.log(error)
                resolve(error)
            }
        })
      },
      cancelorder: (userId, orderId) => {
        return new Promise(async (resolve, reject) => {

            console.log(orderId);
            const cancelledResponse = await orderSchema.findOneAndUpdate(
                { _id: new ObjectId(orderId) },
                { $set: { orderStatus: "cancelled" } },
                {new:true}
            )
            console.log("cancelledResponse", cancelledResponse);
            console.log("cancelledResponse.totalAmount", cancelledResponse.totalAmount);
            
            if(cancelledResponse.paymentMethod!='COD'){
                await walletHelper.addMoneyToWallet(userId,cancelledResponse.totalAmount);
            }
            


            resolve(cancelledResponse.orderStatus)
        })
    },
      

      orderReturn:(userId,orderId,returnReason)=>{
        return new Promise(async(resolve,reject)=>{
            const order = await orderSchema.findOne({_id: new ObjectId(orderId)})
            console.log("inside returnOrder",order)

            if(order.orderStatus=='delivered'){
                order.orderStatus='return pending'
                order.returnReason=returnReason
            }else if(order.orderStatus=='return pending'){
                order.orderStatus='returned'
            }

        

            await order.save()
            console.log("after the order returned",order)
            resolve(order)
        })
      }
      
      

}