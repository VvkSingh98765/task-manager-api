const app=require('./app')

const port = process.env.PORT


app.get('',(req,res)=>{
    res.send({
        info:'Please visit: '+'https://github.com/VvkSingh98765/task-manager-api'
    })
})



app.listen(port, () => {
    console.log('Server is up on port:' + port)
})