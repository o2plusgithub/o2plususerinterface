var express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
const session = require('express-session');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var moment = require('moment');
const request = require('request');
const cryptoRandomString = require('crypto-random-string');
var ejs = require('ejs');
const PORT = process.env.PORT || 5000;
const helmet = require('helmet');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const expressip = require('express-ip');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('IPx3zITsOPot5Vq60Y6L');
var pull = require('array-pull');
const ytdl = require('ytdl-core');
var ytpl = require('ytpl');
const getVideoId = require('get-video-id');
var MongoDBStore = require('connect-mongodb-session')(session);

var app = express();

var store = new MongoDBStore({
    uri: 'mongodb+srv://C6hivgPRCjxKGF9f:yW3c3fc8vpM0ego368z80271RCH@o2plusdatabase.vwl00.mongodb.net/userSessions?retryWrites=true&w=majority',
    collection: 'userSessions',
    expires: 1000 * 60 * 60 * 24 * 30, // expire in mongo 4hrs
});

// Catch errors
store.on('error', function(error) {
    console.log('CANT CONNECT TO MongoDBStore !!!');
    console.log(error);
});

app.use(session({
    secret: 'U5EAM0SCAD37CLjpLp7a',
    cookieName: "OMWC",
    saveUninitialized: true,
    resave: true,
    store: store,
    cookie: {
        maxAge: 3 * 60 * 60 * 1000
    }
}));
app.use(expressip().getIpInfoMiddleware);
app.set('view engine', 'ejs');

//app.use(
//  helmet({
//    contentSecurityPolicy: false,
//  })
//);



app.use(express.static(__dirname + '/views'));

//app.use(function(req, res, next) {
//    if (req.headers['x-forwarded-proto'] !== 'https') {
//        return res.status(404).render('website_error.ejs');
//    } else {
//        next();
//    }
//})


var user_details_server = new Schema({
    username: String,
    password: String,
    branch: String,
    phonenumber: Number,
    phoneverified: Boolean,
    unique_id: String,
    userblocked: Boolean,
    video_watch_hour: Number,
    logincount: Number,
    lec_quality: String,
    like: { type: [String], default: undefined },
    dislike: { type: [String], default: undefined },
    points: Number,
    rank: Number
}, {
    collection: 'user_details'
});
var connect1 = mongoose.createConnection('mongodb+srv://C6hivgPRCjxKGF9f:yW3c3fc8vpM0ego368z80271RCH@o2plusdatabase.vwl00.mongodb.net/userdetails?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
var user_details_model = connect1.model('user_details_model', user_details_server);

var subjectlist_server = new Schema({
    branch: String,
    subject: String,
    playlist: String,
    lec_num: Number,
    lec_name: String,
    lec_time: String,
    sublike: Number,
    subdislike: Number,
    views: Number,
    comments: [{
        commentor: String,
        rank: Number,
        commentor_msg: String
    }]
}, {
    collection: 'subjectlist_details'
});


var connect2 = mongoose.createConnection('mongodb+srv://C6hivgPRCjxKGF9f:yW3c3fc8vpM0ego368z80271RCH@o2plusdatabase.vwl00.mongodb.net/subjectlistdetails?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
var subjectlist_model = connect2.model('subjectlist_model', subjectlist_server);


app.get('/registration_page', function(req, res) {
	var sess = req.session;
    if (true) {
    	sess.unique_id = "qazwsxed2";
    	// remember to modify uniqueids
        res.render("registration.ejs");
    } else {
        res.render("error.ejs");
    }

});

app.post('/registration', urlencodedParser, function(req, res) {
    var sess = req.session;
    if (true) {
        var response = { username: req.body.username, password: req.body.password, branch: req.body.branch, phonenumber: req.body.phonenumber, phoneverified: false, unique_id: sess.unique_id, userblocked: true, video_watch_hour: 0, lec_quality: "highest", logincount: 0, like: [], dislike: [], points: 0, rank: 0 };
        reg_verify_deviceid_username(sess.unique_id, req.body.username, req.body.phonenumber).then(function(result) {
            if (result) {
                if (result.dupname || result.dupdev || result.dupphone) {
                    var response_result = { form_dupname: result.dupname, form_dupdev: result.dupdev, form_dupphone: result.dupphone, form_success: false };
                    res.end(JSON.stringify(response_result));
                } else {
                    user_details_model.create(response, function(err, result) {
                        if (err) {
                            console.log(err);
                            var response_result = { form_dupname: result.dupname, form_dupdev: result.dupdev, form_dupphone: result.dupphone, form_success: false };
                            res.end(JSON.stringify(response_result));
                        } else {
                            var response_result = { form_dupname: result.dupname, form_dupdev: result.dupdev, form_dupphone: result.dupphone, form_success: true };
                            res.end(JSON.stringify(response_result));
                        }
                    })
                } /**/
            }
        })
    } else {
        var response_result = { form_dupname: false, form_dupdev: true, form_dupphone: false, form_success: false };
        res.end(JSON.stringify(response_result));
    }
})

async function reg_verify_deviceid_username(unique_id, username, phonenumber) {
    let promise1 = new Promise((resolve, reject) => {
        user_details_model.countDocuments({ "username": username }, function(err, c) {
            if (err) {
                console.log(err);
                resolve(false)
            } else {
                if (c >= 1) { resolve(true) } else { resolve(false) }
            }
        })
    }).catch(error => {
        console.log(error)
        resolve(false)
    })
    let promise2 = new Promise((resolve, reject) => {
        user_details_model.countDocuments({ "unique_id": unique_id }, function(err, c) {
            if (err) {
                console.log(err);
                resolve(false)
            } else {
                if (c >= 1) { resolve(true) } else { resolve(false) }
            }
        })
    }).catch(error => {
        console.log(error)
        resolve(false)
    })
    let promise3 = new Promise((resolve, reject) => {
        user_details_model.countDocuments({ "phonenumber": phonenumber }, function(err, c) {
            if (err) {
                console.log(err);
                resolve(false)
            } else {
                if (c >= 1) { resolve(true) } else { resolve(false) }
            }
        })
    }).catch(error => {
        console.log(error)
        resolve(false)
    })
    let resultfinal1 = await promise1;
    let resultfinal2 = await promise2;
    let resultfinal3 = await promise3;
    var dup_response = { dupname: resultfinal1, dupdev: resultfinal2, dupphone: resultfinal3 };
    return dup_response;
}

app.get('/first_time_registration', function(req, res) {
	res.render("first_time_registration.ejs")
})


app.get('/login_page', function(req, res) {
	var sess = req.session;
    if (true) {
    	sess.unique_id = "qazwsxed2";
    	// remember to modify uniqueids
        res.render("login.ejs");
    } else {
        res.render("error.ejs");
    }
});

app.post('/visitorid', urlencodedParser, function(req, res) {
    var sess = req.session;
    sess.fingerprint = req.body.visitorId;
    var response = { status: true };
    console.log(sess);
    res.send(JSON.stringify(response));
})


app.post('/login', urlencodedParser, function(req, res) {
    var sess = req.session;
    if (true) {
        var response = { username: req.body.username, password: req.body.password, unique_id: sess.unique_id };
        database_search({ username: req.body.username }).then(function(result) {
            if (result) {
                if (response.username == result.username && response.password == result.password && response.unique_id == result.unique_id) {
                    sess.username = result.username;
                    sess.password = result.password;
                    sess.branch = result.branch;
                    sess.phonenumber = result.phonenumber;
                    sess.phoneverified = result.phoneverified;
                    sess.unique_id = result.unique_id
                    sess.userblocked = result.userblocked;
                    sess.video_watch_hour = result.video_watch_hour;
                    sess.logincount = result.logincount;
                    sess.like = result.like;
                    sess.dislike = result.dislike;
                    sess.lec_quality = result.lec_quality;
                    sess.points = result.points;
                    sess.rank = result.rank;
                    sess.tokencode = cryptr.encrypt(sess.username + moment().format("DDMMYYYY"));
                    updatevalue({ username: sess.username, unique_id: sess.unique_id }, { logincount: sess.logincount + 1 });
                    if (sess.userblocked == true){
                    	var response_result = { form_ver: 'valid pswd', form_redirect: 'first_time_registration' };
                    	res.end(JSON.stringify(response_result));
                    } else {
                    	var response_result = { form_ver: 'valid pswd', form_redirect: 'home' };
                    	res.end(JSON.stringify(response_result));
                    }
                } else if (response.username == result.username && response.password == result.password && response.unique_id != result.unique_id) {
                    var response_result = { form_ver: 'dup device', form_redirect: '' };
                    res.end(JSON.stringify(response_result));
                } else {
                    var response_result = { form_ver: 'invalid pswd', form_redirect: '' };
                    res.end(JSON.stringify(response_result));
                }
            } else {
                var response_result = { form_ver: 'invalid user', form_redirect: '' };
                res.end(JSON.stringify(response_result));
            }
        });
    } else {
        var response_result = { form_ver: 'invalid user', form_redirect: '' };
        res.end(JSON.stringify(response_result));
    }
})


async function database_search(search_parameters) {
    let promise = new Promise((resolve, reject) => {
        user_details_model.find(search_parameters, function(err, result) {
            if (err) {
                console.log(err);
                resolve(null);
                res.end('failed');
            } else {
                resolve(result[0]);
            }
        })
    }).catch(error => {
        resolve(null);
        console.log(error)
    })
    let resultfinal = await promise;
    return resultfinal; // "done!"
}

async function updatevalue(search_value, newupdatevalue) {
    let promise = new Promise((resolve, reject) => {
        user_details_model.findOneAndUpdate(search_value, { $set: newupdatevalue }, { new: true }, (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
                resolve('fail');
            }
            console.log(doc);
            resolve('success');
        });
    }).catch(error => {
        resolve('fail');
        console.log(error)
    })
    let resultfinal = await promise;
    return resultfinal;
}




app.listen(PORT, function() { console.log('Server Started !!!') });