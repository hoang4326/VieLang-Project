const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.use(express.json());
const cors = require('cors');
app.use(cors());
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcryptjs');
const path = require("path");
// app.set("view engine", "ejs");
app.use(express.urlencoded({extended:false}));
const hbs = require('nodemailer-express-handlebars');
const multer = require('multer');

app.use('/public', express.static('public'));
const DIR = './public/';

const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

const JWT_SECRET ="fafsfafw4124wrwqr#@#fasfasfsafasfsffa4%$@%@%";

const mongoUrl = 
    "mongodb://hoang4326:hoang190506@ac-ibx7lch-shard-00-00.jh8v5og.mongodb.net:27017,ac-ibx7lch-shard-00-01.jh8v5og.mongodb.net:27017,ac-ibx7lch-shard-00-02.jh8v5og.mongodb.net:27017/vielangDatabase?replicaSet=atlas-1mz6xt-shard-0&ssl=true&authSource=admin"

mongoose
    .connect(mongoUrl,{
        useNewUrlParser: true,
    })
    .then(()=>{
        console.log("Connect to database");
    })
    .catch((e)=>console.log(e));
require("./models/userDetails");
require("./models/topic");
require("./models/lesson");

const Lesson = mongoose.model("Lesson");
const Topic = mongoose.model("Topic");
const User = mongoose.model("UserInfo");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName  = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName )
    }
});

var upload = multer({
    storage: storage,
    filename: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

var uploadMultiple = upload.fields([{name: 'imgTopic'},{name: 'imgLesson'} ])

app.post("/addTopic",uploadMultiple, async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const vocab = [];
    const countTopic = await Topic.countDocuments({});
    const id = countTopic + 1;
    const name =  req.body.name;
    //Add to array imgTopic
    imgTopic = req.files.imgTopic;
    let fileTopic = imgTopic[0].filename;
    imgTopic.forEach((item) => item.urlImage = url + '/public/' + fileTopic);
    console.log(imgTopic);
    //Add to array imgLesson
    imgLesson = req.files.imgLesson;
    let fileLesson = imgLesson[0].filename;
    imgLesson.forEach((item) => item.urlImage = url + '/public/' + fileLesson);
    console.log(imgLesson);
    try{
        const oldTopic = await Topic.findOne({name});
        if(oldTopic){
            return res.send({status:"Topic exits"});
        }
        await Topic.create({
            name: name,
            topicImg: imgTopic,
            lessonImg: imgLesson,
            id: id,
            vocab: vocab,
        })
    res.send({status:"ok"});
    }catch(error){
        res.send({status:"error"});
        console.log(error);

    }
})

app.get("/topic/:id",async (req, res) => {
    const {id} = req.params;
    const lesson = await Lesson.find({topicId: id});
    const url = await Topic.find({_id:id},{_id: 0,lessonImg: 1});
    const vocab = await Topic.find({_id:id},{_id: 0,vocab: 1 });
    const topic = await Topic.find({_id:id},{_id: 0,name: 1 });

    res.send([lesson, url, vocab, topic]);
})
app.get("/topic",async (req, res)=>{
    const topicL = await Topic.find({id: { $mod: [ 2, 1 ] }});
    const topicR = await Topic.find({id: { $mod: [ 2, 0 ] }});
    // res.send({topicL: topicL, topicR: topicR} );
    // res.send([topicL, topicR] );
    res.send([data1 = topicL, data2 = topicR] );

});

app.post("/do-post", async function (request, result){
    const {lessonId} = request.body
    const {token} = request.body;
    const decodeToken = jwt.verify(token, JWT_SECRET);
    const userId = decodeToken._id;
    // const {userId} = request.body;
    await Lesson.findOne({
        "_id" : mongoose.Types.ObjectId(lessonId)
    }, function (error, item){
        if(item.isFinished === null || item.isFinished === undefined){
            Lesson.findOneAndUpdate({
                "_id" : mongoose.Types.ObjectId(lessonId),
            },{
                $set: {
                    isFinished: 
                        {"_id": userId}
                        
                }
            },{
                new: true
            },function (error, data){
                console.log(data);
                return result.json({
                    "status": "success",
                    "message": "UserId has been inserted",
                });
            });
        }else if (item.isFinished.find(e => e._id.toString() === userId)){
            return result.json({
                "status": "error",
                "message": "Already had this UserId"
            });
        }else{
            Lesson.findOneAndUpdate({
                "_id" : mongoose.Types.ObjectId(lessonId),
            },{
                $push: {
                    isFinished: 
                        {"_id": userId}
                    
                }
            },{
                new: true
            },function (error, data){
                console.log(data);
                return result.json({
                    "status": "success",
                    "message": "UserId has been inserted",
                });
            });  
        }
    })
})

app.post("/signup",async(req,res)=>{
    const {name, email, username, password, role } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);
    try{
        const oldUser = await User.findOne({email});
        if(oldUser){
            return res.send({status:"User exits"});
        }
        await User.create({
            name,
            email,
            username,
            password:encryptedPassword,
            role
            
        });
    res.send({status:"ok"});
    }catch(error){
        res.send({status:"error"});
    }
});

app.post("/login",async(req,res)=>{
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if(!user){
        return res.json({error:"User not found"});
    }
    if ( await bcrypt.compare(password, user.password) ){
        const token = jwt.sign({email: user.email, role: user.role, _id: user._id}, JWT_SECRET, {
            expiresIn: "5h"
        });
        if(res.status(201)){
            return res.json({status : "ok", data : token, role: user.role});
        }else{
            return res.json({error : "error"});
        }
    }
    res.json({status: "error", error: "Invalid password"});
})
app.get("/getRole",async function(req, res) {
    const {token} = req.body;
    const user = jwt.verify(token, JWT_SECRET);
    const userRole = user.role;
    res.send(userRole);

})
app.post("/userData", async (req, res) => {
    const {token} = req.body;
    try{
        const user = jwt.verify(token, JWT_SECRET);
        const useremail = user.email;
        User.findOne({email:useremail})
        .then((data) =>{
            res.send({status:"ok",data: data});
        })
        .catch((error) => {
            res.send({status:"error",data: error});
        });
    }
    catch(error){

    }
});

app.post('/forgot-password',async (req, res) => {
    const {email} = req.body;
    try{
        const oldUser = await User.findOne({email});
        if (!oldUser){
            return res.json({status: "User not exist!!"});
        }
        const secret = JWT_SECRET + oldUser.password;
        const token = jwt.sign({email: oldUser.email, id: oldUser._id}, secret,{
            expiresIn: "5m",
        });
        const link = `http://localhost:3000/reset-password/${oldUser._id}/${token}`;
        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "vielang123@gmail.com",
                pass: "kowgahyxefqtgqxh"
            }
        });

        transporter.use('compile', hbs({
            viewEngine: {
                defaultLayout: false,
            },
            viewPath: path.resolve(__dirname, "views")
        }));

    
        var mailOptions = {
            from: 'VieLang',
            to: req.body.email,
            subject: 'Password reset',
            context: {
                name: oldUser.name,
                link: link
            },
            attachments:[{
                filename: 'image-2.png',
                path:  './views/images/image-2.png',
                cid: 'image-2'
            },
            {
                filename: 'email.png',
                path:   './views/images/email.png',
                cid: 'email'
            },
            {
                filename: 'image-3.png',
                path: './views/images/image-3.png',
                cid: 'image-3'
            },
            {
                filename: 'image-1.png',
                path:  './views/images/image-1.png',
                cid: 'image-1'
            },
            {
                filename: 'image-4.png',
                path:  './views/images/image-4.png',
                cid: 'image-4'
            },
            {
                filename: 'image-6.png',
                path:  './views/images/image-6.png',
                cid: 'image-6'
            },

        ],
            template: 'email'
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });
        
    console.log(link);
    }catch(error){}
});
// app.get('/userRole/:id', async (req, res) =>{
//     const {id} = req.params;
//     const oldUser = await User.findOne({_id: id});
//     if (!oldUser){
//         return res.json({status: "User not exists!!"});
//     }
//     res.send({role: oldUser.role});
// })

app.get('/reset-password/:id/:token', async (req, res) => {
    const {id, token} =req.params;
    console.log(req.params);
    const oldUser = await User.findOne({_id: id});
    if (!oldUser){
        return res.json({status: "User not exists!!"});
    }
    const secret = JWT_SECRET + oldUser.password;
    try{
        const verify = jwt.verify(token, secret);
        res.send({email: verify.email, status: "Not Verrifed"})
    }catch(error){
        res.send("Not Verrifed")
    }
})

app.post('/reset-password/:id/:token', async (req, res) => {
    const {id, token} =req.params;
    const {password} = req.body;
    console.log(req.params);
    const oldUser = await User.findOne({_id: id});
    if (!oldUser){
        return res.json({status: "User not exists!!"});
    }
    const secret = JWT_SECRET + oldUser.password;
    try{
        const verify = jwt.verify(token, secret);
        const encryptedPassword = await bcrypt.hash(password,10);
        await User.updateOne({
            _id: id
        },{
            $set:{
                password: encryptedPassword,
            }
        })
        .then(() => {
            res.send({email: verify.email, status:"verified"})
        })
        .catch((error) =>{
            res.send({status:"Not Verrifed", email: error })
        });
    }catch(error){
        res.send("Not Verrifed")
    }
})
    
app.listen(5000, ()=>{
        console.log("Server started");
    })