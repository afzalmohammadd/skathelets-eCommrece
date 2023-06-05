const users = require("../models/userModel")



const BlockOr=async (req,res,next)=>{
    try{
        const userBlock=await users.findById(req.session.user._id).where({blockUser:true})
        

        if(!userBlock){
            next()
        }else{
            console.log("hai");
            req.session.user = false
            res.render('shop/login.ejs', {
                layout: "layouts/userLayout",
                user: true
            })
        }
    }catch(error){
        res.status(500).redirect({message:"internal error occured"})
    }
}

module.exports={
    BlockOr
}
