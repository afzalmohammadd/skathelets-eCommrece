const addressSchema=require('../models/addressModel');
const ObjectId=require('mongoose').Types.ObjectId

module.exports={
    addAddress:(addressData)=>{
        
        return new Promise(async (resolve,reject)=>{
            let address = await new addressSchema(                                                                                                                                                                                                                                                                                           {
                first_name:addressData.fname,
                last_name:addressData.lname,
                mobile:addressData.mobile,
                email_id:addressData.email,
                address:addressData.address,
                city:addressData.city,
                state:addressData.state,
                country:addressData.country,
                pincode:addressData.pincode,
                userId:addressData.id
            })
            console.log("+++++++++++++");
            console.log(address)
            console.log("++++++++")
            await address.save();
            resolve(address)
        })
        
    },
    findAddresses:(user)=>{
        return new Promise(async(resolve,reject)=>{
            await addressSchema.find({userId: user})
            .then((result)=>{
                resolve(result)
            })
        })
    },
    getAnAddress:(addressId)=>{
        return new Promise(async(resolve,reject)=>{
            await addressSchema.findById(addressId)
            .then((result)=>{
                console.log("inside helper");
                resolve(result)
            })
        })
    },
    editAnAddress : async (editedAddress) => {
        return new Promise(async (resolve, reject) => {
          try {
            console.log("edit add", editedAddress);
            let address = await addressSchema.findById(editedAddress.addressId);
            console.log("edit address", address);
      
            address.first_name = editedAddress.fname;
            address.last_name = editedAddress.lname;
            address.mobile = editedAddress.mobile;
            address.email_id = editedAddress.email;
            address.address = editedAddress.address;
            address.country = editedAddress.country;
            address.state = editedAddress.state;
            address.city = editedAddress.city;
            address.pincode = editedAddress.pincode;
            
      
            await address.save();
            resolve(address);
          } catch (error) {
            reject(error);
          }
        });
      }
      
}