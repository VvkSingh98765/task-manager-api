const mongoose=require('../db/connection')
const validator=require('validator')
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task-model')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        validate:function(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain password')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.methods.toJSON=function(){
    const user=this

    const userObject=user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


//used to create a relation ship from Users to tasks 
userSchema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'owner'
})


userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({
        email:email,
    })

    if(!user){
        throw new Error('unable to login')
    }

    const isMatch=await bcryptjs.compare(password,user.password)
    if(!isMatch){
        throw new Error('unable to login')
    }

    return user
}

//Generating authentication token 
userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=await jwt.sign({id:user._id.toString()},process.env.JWT_SECRET_KEY,{expiresIn:'30 days'})
    user.tokens=user.tokens.concat({token})

    await user.save()

    return token
}

//Hashing the plain text password before saving -using mongoose middleware
userSchema.pre('save',async function(next){
    const user=this
    if(user.isModified('password')){
        user.password=await bcryptjs.hash(user.password,8)
    }
    next()
})

//Deleting all task - in case the user is being deleted -using mongoose middleware
userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:this._id})
    next()
})


const User=mongoose.model('User',userSchema)

module.exports=User