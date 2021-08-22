const jwt=require('jsonwebtoken')
const User=require('../models/user-model')

const auth=async(req,res,next)=>{
    try{
        console.log(process.env.JWT_SECRET_KEY)
        const token=req.header('Authorization').replace('Bearer ','')
        const data=jwt.verify(token,process.env.JWT_SECRET_KEY)
        //console.log(data)
        const user=await User.findOne({_id:data.id,'tokens.token':token})
       //console.log(user)

        if(!user){
            throw new Error()
        }
        req.user=user
        req.token=token
        next()
    }catch(e){
        res.status(401).send({
            Error:'Please authenticate'
        })
    }
}

module.exports=auth