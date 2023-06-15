const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        orderedItems:[
            {
                product:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'products'
                },
                quantity:Number
            }
        ],

        orderedPrice:{
            type:Array,
            default:[]
        },
        address:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'addresses'
        },
        orderDate:Date,
        coupon:{
            type: String,
            default: null
        },

        returnReason:{
            type:String,
        
        },
        
        totalAmount: Number,
        // finalAmount:Number,
        paymentMethod: String,
        orderStatus: {
            type:String,
            enum:['pending', 'processing','confirmed', 'shipped', 'out for delivery' ,'delivered', 'cancelPending' ,'return pending','canceled','returned'],
            default:'pending'
        }
    },
    {
        timestamps: true,
    }
);

module.exports = new mongoose.model("Order", orderSchema);