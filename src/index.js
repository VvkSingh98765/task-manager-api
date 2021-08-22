const express = require('express')
const User = require('./models/user-model')
const Task = require('./models/task-model')
const userRouter=require('./routers/users')
const taskRouter=require('./routers/tasks')
const multer=require('multer')


const port = process.env.PORT
const app = express()

console.log(process.env.JWT_SECRET_KEY)
console.log(process.env.USER)
console.log(process.env.MONGODB_URL)


const uploads=multer({
    dest:'images',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(file.originalname.match(/\.(doc|docx)$/)){
            return cb(undefined,true)
        }

        cb('only doc or docx formats are accepted')

    }
})

const errorMiddleware=(next)=>{
    if(1===1){
        throw new Error('From custom middleware')
    }

    next()
}

app.post('/uploads',errorMiddleware,(req,res)=>{
    res.send()
},(error,req,res,next)=>{
    res.send({
        Error:error.message
    })
})

app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port:' + port)
})