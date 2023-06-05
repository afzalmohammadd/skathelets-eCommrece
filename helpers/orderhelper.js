const addressSchema = require('../models/addressModel')
const orderSchema = require('../models/orderModel');

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
            // let address= await addressSchema.findById({_id:order.addressSelected})
            let paymentMethod = order.payment;
            let addressId = order.addressSelected;
            let orderedItems = cartItems
            console.log("orderedItems", orderedItems)

            console.log("orderedItems orderHelper ", orderedItems)
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
            console.log("upoladed to dbbbbbbbbbbbbbbb")
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

            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            console.log("This is aggregation result", userOrderDetails);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            resolve(userOrderDetails);
        });
    },
    cancelOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const updatedOrder = await orderSchema.findByIdAndUpdate(orderId, { orderStatus: 'canceled' }, { new: true })
                console.log('Order status updated successfully:', updatedOrder);
                resolve(updatedOrder);
            } catch (err) {
                console.error('Error updating order status:', err);
                reject(err);
            }
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
                        totalAmount: 1,
                        paymentMethod: 1,
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
                console.log("orders", result);
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
                    console.log(result);
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
            console.log("orderedItems", orderedItems);

            console.log("orderedItems orderHelper ", orderedItems);
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
            console.log("upoladed to dbbbbbbbbbbbbbbb");
            resolve(ordered._id);
        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var instance = new Razorpay({ key_id: 'rzp_test_uqjS5a2hmaYBoQ', key_secret: 'LmAP75P7IfisHinnntdOcN2f' });
            console.log("inside razorpay");
            instance.orders.create(
              {
                amount: total*100,
                currency: "INR",
                receipt: orderId.toString()
              },
              (error, order) => {
                if (order) {
                  
                  console.log("order+++++razorpay", order);
                  resolve(order)
                } else {
                    console.log("error++++++", error);
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
            console.log("inside orderhelper ",result);
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
                    console.log("orders in the provided date",result)
                    resolve(result)
                })
            }catch(error){
                console.log(error)
                resolve(error)
            }
        })
      }
      
      

}