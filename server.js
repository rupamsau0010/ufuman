require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const fs = require("fs");
const path = require("path");
var multer = require('multer');

// Connecting to the database  
mongoose.connect(process.env.MONGO_URL, 
    { useNewUrlParser: true, useUnifiedTopology: true }, err => { 
        console.log('connected'); 
    }); 

const imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    img: {
        data: Buffer,
        contentType: String
    }
});  

const imgModel = new mongoose.model("Image", imageSchema);

app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json()) 
  
// Set EJS as templating engine  
app.set("view engine", "ejs"); 

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");  
    },

    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now());
    }
});

var upload = multer({storage: storage});

// Retriving the image 
app.get('/', (req, res) => { 
    imgModel.find({}, (err, items) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            res.render('app', { items: items }); 
        } 
    }); 
});

// Uploading the image 
app.post('/', upload.single('image'), (req, res, next) => { 
  
    var obj = { 
        name: req.body.name, 
        desc: req.body.desc, 
        img: { 
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
            contentType: 'image/png'
        } 
    } 
    imgModel.create(obj, (err, item) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            // item.save(); 
            res.redirect('/'); 
        } 
    }); 
});


app.listen('3000' || process.env.PORT, err => { 
    if (err) 
        throw err 
    console.log('Server started') 
}) 

