const express = require('express')
const userRouter=require('./routers/users')
const taskRouter=require('./routers/tasks')


const app = express()

app.use(userRouter)
app.use(taskRouter)


module.exports=app