const express = require('express')
const User = require('../models/user-model')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp=require('sharp')
const {sendWelcomeEmail,sendCancelationEmail}=require('../email/account')

const router = express.Router()

router.use(express.json())

//middleware for avatar
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('only .jpg,.jpeg,.png formats are accepted'))
        }

        cb(undefined, true)

    }
})

//logging in  a user
router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send({
            Error: e.message
        })
    }

})

//create a user
router.post('/user', async (req, res) => {
    const user = new User(req.body)
    try {
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email,user.name)//this is asynchronous , yet i didnt use await here , because ,
        //we dont want our programme to suspend until mail has been sent out.
        res.status(201).send({
            Status: 'Success',
            user,
            token
        })
    } catch (e) {
        res.status(400).send({
            'Error': e.message
        })
    }
})

//end point to upload a picture
router.post('/user/avatar', auth, upload.single('avatar'), async (req, res) => {

    if (req.file) {
        const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()
       return res.send({
            Status: 'Success'
        })
    }
    res.status(400).send({
        Error:'Please add a file'
    })

}, (error, req, res, next) => {
    res.status(400).send({
        Error: error.message
    })
})

//end point to delete a picture
router.delete('/user/me/avatar',auth,async(req,res)=>{
    try{
        if(!req.user.avatar){
            return res.status(404).send({
                Error:'No avatar found'
            })  
        }
        req.user.avatar=undefined
        await req.user.save()
        res.send({
            Status:'Success'
        })
    }catch(e){
        res.status(400).send(e)
    }
})

//end point to fetch a picture , by the user id
router.get('/user/:id/avatar',async(req,res)=>{

    try{
        const user=await User.findById(req.params.id)
        if(!user||!user.avatar){
            throw new Error('Something went wrong')
        }
        res.set('Content-type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send({
            Error:e.message
        })

    }
})

//Reading the user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//Update the user
router.patch('/user/:id', auth, async (req, res) => {

    //console.log('inside-route handler')

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({
            Error: 'Invalid Updates'
        })
    }


    try {
        const user = req.user
        updates.forEach((update) => {
            user[update] = req.body[update]
        })


        //console.log('going for mongoose middleware - userSchema.pre')
        await user.save()
        //console.log('came back from middleware')
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }

})

//logging out the user
router.post('/user/logout', auth, async (req, res) => {
    console.log('here')
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        console.log(req.user.tokens.length)
        await req.user.save()
        res.status(200).send({
            Status: 'Success'
        })
    } catch (e) {
        res.status(500).send()
    }
})

//logging out user from all devices
router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }

})

//delete the user
router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email,req.user.name)//this is asynchronous , yet i didnt use await here , because ,
        //we dont want our programme to suspend until mail has been sent out.
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router