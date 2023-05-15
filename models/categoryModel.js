const mongoose = require('mongoose')

const categoryModel = new mongoose.Schema({
    name: {
        type: String,

    }, 
    description: {
        type: String,

    },
},
    {
        timestamps: true
    }
)

const category = mongoose.model("category", categoryModel);

module.exports = category