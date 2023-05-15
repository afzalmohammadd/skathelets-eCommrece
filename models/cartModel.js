const mongoose = require('mongoose')

const cartModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity:{
            type:Number,
            required:true,
            default:1
        }
    }]
}
)

const cartDB = mongoose.model("shoppingCart", cartModel);

module.exports = cartDB