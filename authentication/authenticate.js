const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');
const {temp,perma}=require('../database/db');
const {local_link}=require('../urls/links');
const nodemailer=require('nodemailer');
const ejs=require('ejs');


const transporter= nodemailer.createTransport({
    service:"gmail",
    auth:{
    type:"OAuth2",
    user:"test9051571833@gmail.com",
    clientId:"197901312379-he0vh5jq4r76if10ahv30ag8ged6f0in.apps.googleusercontent.com",
    clientSecret:"bdZnQ154LMlm-cNxsDVj0NF-",
    refreshToken:"1/No8FlpE48nH8rpMTCL0Jf0AqShv511qEk1BgoWe9v70"
    }
})

//verification link after registration
const verfiy=(email,token)=>{
    const mailoption={
        from:"test9051571833@gmail.com",
        to:email,
        subject:"Delivery Verificatio",
        html:'<p>Click the link for Completing your verification process your password<a href="http://localhost:3002/authentication/verification/'+token+'">Verify</a></p>'
    }

    transporter.sendMail(mailoption,(err,res)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log(res);
        }
    })
}

//verification link sending for resetting password
const resetpass=(email,token)=>{
    const mailoption={
        from:'test29051571833@gmail.com',
        to:email,
        subject:"Deliver Reset password",
        html:'<p>Click the link for Reseting your password<a href="http://localhost:3002/authentication/reseting/'+token+'">Verify</a></p>'
    }

    transporter.sendMail(mailoption,(err,res)=>{
        if(err)
            console.log(err)
        else
            console.log(res)
    })
}



//registering user route
router.post('/register',(req,res)=>{
    perma.findOne({Email:req.body.Email}).then(user=>{
        if(user){
        res.status(200).json({response:"1"});
        }
        else{
        const db=new temp
        db.device_id=req.body.device_id
        db.Name=req.body.Name
        db.Password=req.body.Password
        db.MobileNo=req.body.MobileNo
        db.Email=req.body.Email
        db.IMEI=req.body.IMEI
        db.Flag=0
        db.Date=new Date()
        db.response="0"
        db.save().then(user=>{
            if(user){
                jwt.sign({user:user.Email},"suab",(err,token)=>{
                    verfiy(user.Email,token);
                    res.status(200).json({response:"0"});
                })
            }
        }).catch(err=>{
        res.status(200).json({response:"1"});  
    })
        }
    })
})

//verifying when user clicks on link on gmail
router.get('/verification/:token',(req,res)=>{
    jwt.verify(req.params.token,"suab",(err,authdata)=>{
         perma.findOne({Email:req.params.email}).then(user=>{
            if(user)
                res.status(200).json({response:"1"})
            else{
                temp.findOneAndDelete({Email:authdata.user}).then(user=>{
                    const db=new perma
                    console.log("64"+user.IMEI)
                    db.device_id=user.device_id
                    db.Name=user.Name
                    db.Password=user.Password
                    db.MobileNo=user.MobileNo
                    db.Email=user.Email
                    db.IMEI=user.IMEI
                    db.Flag=user.Flag
                    db.Date=new Date()
                    db.response="1"
                    db.save().then(user=>{
                        res.status(200).json({response:"1"});
                    })
                })
            }
        }).catch(err=>{res.status(200).json({response:"2"})})
    })
})

//logging in user
router.post('/login',(req,res)=>{
    perma.findOne({Email:req.body.Email}).then(user=>{
        if(req.body.Password === user.Password)
            {
                perma.findById({_id:user.id},{Password:false}).then(user=>{
                    res.status(200).json(user);
                })
            }
        else
            res.status(400).json({response:"2"});
    }).catch(err=>{
    temp.findOne({Email:req.body.Email}).then(user=>{
        if(user){
            res.status(400).json({response:"3"})
        }
        else{
            res.status(400).json({response:"4"});
        }
    }).catch(err=>{
        res.status(400).json({response:"4"})
    })
})
})


//reseting password email sending
router.get('/resetpass/:email',(req,res)=>{
    console.log(req.params.email)
    perma.findOne({Email:req.params.email}).then(user=>{
        console.log(user)
        if(user){
            jwt.sign({user:user.Email},"suab",(err,token)=>{
                resetpass(user.Email,token);
                res.status(200).json({response:"1"});
            })
        }
        else{
            res.status(200).json({response:"4"});
        }
    }).catch(err=>{
        console.log(err);
        res.status(200).json({response:"4"});
    })
})


//link for new password req coming here from frontend ejs
router.post('/ressetingdone/:token',(req,res)=>{
    jwt.verify(req.params.token,"suab",(err,authdata)=>{
        perma.findOneAndUpdate({Email:authdata.user},{Password:req.body.password},{new:true}).then(user=>{
            res.status(200).json(user);
        }).catch(err=>{res.send(req.params.email)})
    })
})

//new password frontend after clicking on link on gmail
router.get('/reseting/:token',(req,res)=>{
    res.render('pass',{email:req.params.token})
})


module.exports={
    auth_route:router
}