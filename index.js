var express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
const session = require('express-session');
var urlencodedParser = bodyParser.urlencoded({ extended: false});
var moment = require('moment'); // require
const request = require('request');
const cryptoRandomString = require('crypto-random-string');
var ejs = require('ejs');
const PORT = process.env.PORT || 5000;
const helmet = require('helmet');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const expressip = require('express-ip');

var app = express();
// OSC = O2Plus Main Web cookie
// helmet is needed for hsts => very important to block attacks 
app.use(session(
  {
    secret: 'U5EAM0SCAD37CLjpLp7a',
    cookieName: "OMWC", 
    saveUninitialized: true,
    resave: true, 
    ephemeral: true,
    cookie: { 
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 3*60*60*1000
    }
  }
  )
);
app.use(expressip().getIpInfoMiddleware);
app.set('view engine', 'ejs');
////////// remember to enable here /////////////////

//app.use(helmet());
//app.use(express.static(__dirname));

//app.use(function (req, res, next) {
//  if (req.headers['x-forwarded-proto'] !== 'https'){
//      return res.status(404).render('website_error.ejs');
//    } else {
//    next();
//    }
//})
// update the version of app here 

var sess; // global session, NOT recommended

var user_details_server = new Schema({
    username: String,
    password : String,
    branch: String,
    phonenumber: Number,
    phoneverified: Boolean,
    email: String,
    emailverified: Boolean,
    userip: String,
    fingerprint : String,
    webview_version : String,
    unique_id : String,
    build_fingerprint : String,
    build_hardware : String,
    userblocked: Boolean,
    video_watch_hour: Number,
    logincount: Number,
    like: {type: [String], default: undefined},
    dislike: {type: [String], default: undefined},
    rank: Number
}, {
    collection: 'user_details'
});


app.get('/',function(req,res){
  sess = req.session;
  sess.ipinfo = req.ipInfo;
  console.log(sess);
  res.send("hello");
});

app.get('/willow',function(req,res){
  sess.ipinfo1 = req.ipInfo;
  console.log(sess);
  res.send("hello");
});

app.listen(PORT, function() { console.log('listening')});