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
var useragent = require('express-useragent');
const TelegramBot = require('node-telegram-bot-api');
const token = '1652999404:AAGVjn296VY7nx9v7KQK0k-Tq3xcWepcbm0';
var server = 1;

const bot = new TelegramBot(token, { polling: true });

var app = express();
app.use(useragent.express());

var store = new MongoDBStore({
    uri: 'mongodb+srv://C6hivgPRCjxKGF9f:yW3c3fc8vpM0ego368z80271RCH@o2plusdatabase.vwl00.mongodb.net/userSessions?retryWrites=true&w=majority',
    collection: 'userSessions',
    expires: 1000 * 60 * 60 * 24, // expire in mongo 24 hrs
    connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000
    }
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

app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

app.use(express.static(__dirname + '/views'));


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
    try {
        var sess = req.session;
        sess.browser_validity = req.useragent.source;
        var token = JSON.parse(cryptr.decrypt(req.query.token));
        sess.unique_id = token.unique_id;
        sess.user_ip = token.user_ip;
        sess.user_city = token.user_city;
        sess.user_state = token.user_state;
        sess.user_country = req.ipInfo.country;
        sess.build_product = token.build_product;
        sess.build_model = token.build_model;
        sess.build_manufacturer = token.build_manufacturer;
        var past_time = token.timestamp;
        var present_time = moment().format('x');
        var time_diff = present_time - past_time;
        console.log(time_diff);
        if (user_country == "IN" && time_diff <= 10000 && sess.browser_validity.includes('Gecko/87.0')) {
            res.render("registration.ejs");
        } else {
            res.render("error.ejs");
        }
    } catch (err) {
        console.log('Error in /registration_page route by user : ' + sess.unique_id + ' on server ' + server);
        console.log(err);
        var err_response_user = "__Error User__ : " + sess.unique_id;
        var err_message = "__Error MSG__ : " + err;
        var err_location = "__Error Location__ : registration_page on server " + server;
        bot.sendMessage('1504299199', "\r\n" + err_response_user + "\r\n" + err_message + "\r\n" + err_location).then(function(resp) {
            console.log('ADMIN updated about error !!!')
        }).catch(function(error) {
            if (error.response && error.response.statusCode === 403) {
                console.log("ADMIN is not connected to o2plusadmin_bot !!!");
            }
        });
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
    sess.useripinfo = req.ipInfo;
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
                    if (sess.userblocked == true) {
                        var response_result = { form_ver: 'valid pswd', form_redirect: 'first_time_registration' };
                        res.end(JSON.stringify(response_result));
                    } else {
                        sess.logincount = sess.logincount + 1;
                        user_details_model.aggregate([{ $match: { points: { $gte: sess.points } } }, { $count: "user_ranking" }]).exec(function(err, result) {
                            sess.rank = result[0].user_ranking;
                            updatevalue({ username: sess.username, unique_id: sess.unique_id }, { logincount: sess.logincount, rank: result[0].user_ranking });
                            user_details_model.count({}, function(err, count) {
                                sess.total_users = count;
                                var response_result = { form_ver: 'valid pswd', form_redirect: 'home' };
                                res.end(JSON.stringify(response_result));
                            })
                        })
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


app.get('/home', function(req, res) {
    var sess = req.session;
    if (true) {
        var response = { username: sess.username, phonenumber: sess.phonenumber, phonestate: sess.phoneverified, userblocked: sess.userblocked, branch: sess.branch, lec_quality: sess.lec_quality, rank: sess.rank, total_users: sess.total_users };
        console.log(response)
        res.render('home.ejs', response);
    } else {
        res.render("error.ejs");
    }
});

app.get('/lecture', function(req, res) {
    var sess = req.session;
    if (true) {
        res.render(sess.branch + '_subjectlist.ejs');
    } else {
        res.render('error.ejs')
    }
})

app.get('/playlist', function(req, res) {
    var sess = req.session;
    if (true) {
        sess.subject = req.query.subject;
        res.render('playlist.ejs');
    } else {
        res.render('error.ejs');
    }
})

app.post('/playlist_info', urlencodedParser, async function(req, res) {
    var sess = req.session;
    if (true) {
        var response_code = { branch: sess.branch, subject: sess.subject };
        var query_code = { lec_num: 1, lec_name: 1 }
        subjectlist_model.find(response_code, query_code).sort({ $natural: -1 }).exec(function(err, result) {
            console.log(result);
            res.send(JSON.stringify(result));
        })
    }
})

//////

app.get('/player', function(req, res) {
    var sess = req.session;
    if (true) {
        sess.lec_num = req.query.lec_num;
        var response_code = { branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num };
        subjectlist_model.findOne(response_code, { lec_name: 1, sublike: 1, subdislike: 1, views: 1, playlist: 1 }, function(err, data) {
            if (err) { console.log(err); };
            sess.sublike = data.sublike;
            sess.subdislike = data.subdislike;
            sess.views = data.views;
            ytpl(data.playlist).then(info => {
                video_url = info.items[0].shortUrl;
                video_url_name = info.items[0].title;
                video_url_id = getVideoId(info.items[0].shortUrl).id;
                ytdl.getInfo(video_url_id).then(info_data => {

                    vid_container = [];
                    for (var i = 0; i < info_data.formats.length; i++) {
                        if (info_data.formats[i].hasVideo == true && info_data.formats[i].hasAudio == true) {
                            vid_container.push(info_data.formats[i]);
                        }
                        if (i == info_data.formats.length - 1) {
                            let formatv = vid_container[0];
                            let formata = vid_container[0];
                            sess.videolink = formatv.url;
                            sess.audiolink = formata.url;
                            console.log(sess);
                        }
                    }

                    var ip_address = sess.useripinfo.ip;

                    if (sess.like.includes(sess.subject + ':' + sess.lec_num)) {
                        var like_status = true;
                        res.render('player.ejs', { ip_address: ip_address, username: sess.username, phonenumber: sess.phonenumber, branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num, lec_name: data.lec_name, like: data.sublike, dislike: data.subdislike, like_status: like_status, views: data.views });
                    } else if (sess.dislike.includes(sess.subject + ':' + sess.lec_num)) {
                        var like_status = false;
                        res.render('player.ejs', { ip_address: ip_address, username: sess.username, phonenumber: sess.phonenumber, branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num, lec_name: data.lec_name, like: data.sublike, dislike: data.subdislike, like_status: like_status, views: data.views });
                    } else {
                        var like_status = '';
                        res.render('player.ejs', { ip_address: ip_address, username: sess.username, phonenumber: sess.phonenumber, branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num, lec_name: data.lec_name, like: data.sublike, dislike: data.subdislike, like_status: like_status, views: data.views });
                    }
                }).catch(error => { console.log(error); return error });
            }).catch(error => { console.log(error); return error });
        })
    } else {
        res.render('error.ejs');
    }
})


app.post('/grimlim', urlencodedParser, function(req, res) {
    var sess = req.session;
    if (true) {
        var response_code = { branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num };
        subjectlist_model.findOneAndUpdate(response_code, { $set: { "views": sess.views + 1 } }, { new: true }, function(err, data) {
            if (err) { console.log(err); }
            sess.views = sess.views + 1;
            console.log(data);
        })
        var response_code = { fv: sess.videolink, fa: sess.audiolink };
        res.send(JSON.stringify(response_code));
    }
})


app.post('/player_comment_preload', urlencodedParser, function(req, res) {
    var sess = req.session;
    if (true) {
        var response_code = { branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num };
        subjectlist_model.findOne(response_code, { comments: 1 }, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                var data_temp = data.comments;
                res.send(JSON.stringify(data_temp));
            }
        })
    }
})

app.post('/player_comment', urlencodedParser, function(req, res) {
    var sess = req.session;
    if (true) {
        var response_code = { branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num };
        var comment_temp = { commentor: sess.username, rank: sess.rank, commentor_msg: req.body.comment_msg };
        subjectlist_model.findOne(response_code, { comments: 1 }, function(err, data) {
            var data_temp = data.comments;
            if (data_temp.length < 50) {
                data_temp.push(comment_temp);
            } else {
                data_temp.pop(comment_temp);
                data_temp.push(comment_temp);
            }
            subjectlist_model.findOneAndUpdate(response_code, { $set: { comments: data_temp } }, { new: true }, function(err, data) {
                res.send(JSON.stringify(comment_temp));
            })
        })
    }
})





app.post('/vote', urlencodedParser, function(req, res) {
    var sess = req.session;
    if (true) {
        if (req.body.vote == "") {
            pull(sess.dislike, sess.subject + ':' + sess.lec_num);
            pull(sess.like, sess.subject + ':' + sess.lec_num);
            sess.sublike = req.body.like_value;
            sess.subdislike = req.body.dislike_value;
            user_details_model.findOneAndUpdate({ "username": sess.username }, { $set: { "like": sess.like, "dislike": sess.dislike } }, { new: true }, function(err, data) {
                console.log(data);
            })
            subjectlist_model.findOneAndUpdate({ "branch": sess.branch, "subject": sess.subject, "lec_num": sess.lec_num }, { $set: { "sublike": req.body.like_value, "subdislike": req.body.dislike_value } }, { new: true }, function(err, data) {
                console.log(data);
            })
            res.send(JSON.stringify({ like: sess.like, dislike: sess.dislike, sublike: sess.sublike, subdislike: sess.subdislike }));
        }

        if (req.body.vote == "true") {
            pull(sess.dislike, sess.subject + ':' + sess.lec_num);
            sess.like.push(sess.subject + ':' + sess.lec_num);
            sess.sublike = req.body.like_value;
            sess.subdislike = req.body.dislike_value;
            user_details_model.findOneAndUpdate({ "username": sess.username }, { $set: { "like": sess.like, "dislike": sess.dislike } }, { new: true }, function(err, data) {
                console.log(data);
            })
            subjectlist_model.findOneAndUpdate({ "branch": sess.branch, "subject": sess.subject, "lec_num": sess.lec_num }, { $set: { "sublike": req.body.like_value, "subdislike": req.body.dislike_value } }, { new: true }, function(err, data) {
                console.log(data);
            })
            res.send(JSON.stringify({ like: sess.like, dislike: sess.dislike, sublike: sess.sublike, subdislike: sess.subdislike }));
        }

        if (req.body.vote == "false") {
            pull(sess.like, sess.subject + ':' + sess.lec_num);
            sess.dislike.push(sess.subject + ':' + sess.lec_num);
            sess.sublike = req.body.like_value;
            sess.subdislike = req.body.dislike_value;
            user_details_model.findOneAndUpdate({ "username": sess.username }, { $set: { "like": sess.like, "dislike": sess.dislike } }, { new: true }, function(err, data) {
                console.log(data);
            })
            subjectlist_model.findOneAndUpdate({ "branch": sess.branch, "subject": sess.subject, "lec_num": sess.lec_num }, { $set: { "sublike": req.body.like_value, "subdislike": req.body.dislike_value } }, { new: true }, function(err, data) {
                console.log(data);
            })
            res.send(JSON.stringify({ like: sess.like, dislike: sess.dislike, sublike: sess.sublike, subdislike: sess.subdislike }));
        }
    }

})



app.listen(PORT, function() { console.log('Server Started !!!') });