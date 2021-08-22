const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
})

const sendWelcomeEmail=(email,name)=>{
    const options={
        from:'node-test-vvk6939@outlook.com',
        to:email,
        subject:'Thanks for joining in',
        text:`Welcome to the app, ${name}. Let me know how you get along with the app`
    }
    transporter.sendMail(options,(error,info)=>{
        if(error){
            return console.log(error)
        }
        console.log(info)
    })
}

const sendCancelationEmail=(email,name)=>{
    const options={
        from:'node-test-vvk6939@outlook.com',
        to:email,
        subject:'We are Sorry to see you go',
        text:`Goodbye, ${name}. Let us know what we could have done better`
    }
    transporter.sendMail(options,(error,info)=>{
        if(error){
            return console.log(error)
        }
        console.log(info)
    })
}

//Exporting an object with two propeties , since the properties has same name , we can use ES6 syntax
module.exports={
    sendWelcomeEmail :sendWelcomeEmail,
    sendCancelationEmail

}