const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN 
const serviceSid = process.env.TWILIO_SERVICE_SID

const client = require('twilio')(accountSid,authToken)

module.exports = {
    sentOtp: (mobileNo) => {
        console.log(mobileNo);
        return new Promise((resolve, reject) => {
            client.verify.v2.services(serviceSid)
                .verifications
                .create({
                    to: '+91' + mobileNo,
                    channel: 'sms'
                })
                .then((verification) => {
                    console.log(verification);
                    resolve(verification.sid)
                }).catch((error)=>{
                    console.log(error);
                })
        })
    },
    verifyOtp: (mobileNo, otp) => {
        return new Promise((resolve, reject) => {
            client.verify.v2.services(serviceSid)
                .verificationChecks
                .create({
                    to: '+91'+mobileNo,
                    code: otp
                })
                .then((verification)=> {
                    console.log("verifyyyyyyyyyyyyyyyotp");
                    console.log(verification.status);
                    console.log("verifyyyyyyyyyyyyyyyotp");

                    resolve(verification.valid)
                }).catch((error)=>{
                    res.redirect('/shop/otp-user')
                    console.log(error);
                    resolve(error)

                });
        })
    }
}