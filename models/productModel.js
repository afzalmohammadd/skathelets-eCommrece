const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
   prodName: {
      type: String,
      required: true,
      unique: true
   },
   prodDescription: {
      type: String
   },

   prodPrice: {
      type: Number,
      required: true
   },
   prodQuantity: {
      type: Number
   },

   prodSize: {
      type: String,
      required: true
   },

   prodCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
   },
   prodImage:[
      {
         type: String,
         required: true
      }
   ],
   unList: {
      type: Boolean,
      default: false
   }

})

const productData = mongoose.model('products', productSchema);

module.exports = productData;