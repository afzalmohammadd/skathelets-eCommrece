    
    const users = require("../models/userModel")
    

    const userAuthenticationCheck=async (req,res,next)=>{

        try{
            if(req.session.user){
                res.status(200).redirect('/home')
                
                
            }else{
                next()
            }
        }
        catch(error){
            res.status(500).redirect({message:"internal error occured"})
        }
        
    }

    const userCheck=async (req,res,next)=>{
        try{
            if(req.session.user){
                next()
            }else{
                res.status(200).redirect('/')
            }
        }catch(error){
            res.status(500).redirect({message:"internal error occured"})
        }
    }

    const adminAuthenticationChecking=async (req,res,next)=>{
        try{
            if(req.session.admin){
                res.redirect('/admin/admin-home')
            }else{
                next()
            }
        }catch(error){
            res.status(500).redirect('/error')
        }
    }

    const adminChecking=(req,res,next)=>{
        try {
            if(req.session.admin){
                next()
            }else{
                res.status(200).redirect('/admin')
            }
        } catch (error) {
            res.status(500).redirect('/error')
        }
    }

    module.exports={
        userAuthenticationCheck,
        adminAuthenticationChecking,
        adminChecking,
        userCheck
    }

