const jwt=require('jsonwebtoken')
const User=require('../models/user-model')

const auth=async(req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ','')
        const data=jwt.verify(token,process.env.JWT_SECRET_KEY)
        const user=await User.findOne({_id:data.id,'tokens.token':token})

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