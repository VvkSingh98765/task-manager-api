const express=require('express')
const Task=require('../models/task-model')
const auth=require('../middleware/auth')

const router=express.Router()

router.use(express.json())

//create a task
router.post('/task',auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    // console.log(task)
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send({
            Error: error.message
        })
    }
})

//Read a task by its id
router.get('/task/:id',auth, async (req, res) => {
    const _id = req.params.id
    try {
        //ensures that the task belongs to the same owner - who has been authenticated just now.
        const task = await Task.findOne({ _id,owner:req.user._id})

        if (task) {
            return res.send(task)
        }

        res.status(404).send({
            Error:'Task not found'
        })

    } catch (error) {
        res.status(500).send(error.message)
    }
})

//Read all tasks for logged in user
//support for query string - 
//GET/tasks?completed=true
//GET/tasks?limit=10&skip=20
//GET/tasks?sortBy=createdAt:desc or //GET/taks?sortBy=createdAt:asc
router.get('/tasks', auth,async (req, res) => {
    const match={}
    const sort={}

    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1
    }

    if(req.query.completed){
        match.completed=req.query.completed
    }
    try {
        //const tasks=await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//update a task
router.patch('/task/:id',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['description','completed']

    const isValidOperation=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({
            Error:'Invalid updates'
        })
    }

    try{
        //by adding owner property as one of the search criteria - it ensures that we are updating the task created by the same user.
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send({
                Error:'No such task found'
            })
        }
        updates.forEach((update)=>{
            task[update]=req.body[update]
        })
        await task.save()
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

//delete a task
router.delete('/task/:id',auth,async(req,res)=>{

    try{
        //const tak=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id}) -this also works - no need to use task.remove()
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
       if(!task){
           return res.status(404).send({
               Error:'Task not found'
           })
       }
       task.remove()
       res.send(task)
    }catch(e){
        res.status(500)
    }
})

module.exports=router