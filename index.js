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


var app = express();

app.use(session({
    secret: 'U5EAM0SCAD37CLjpLp7a',
    cookieName: "OMWC",
    saveUninitialized: true,
    resave: true,
    ephemeral: true,
    cookie: {
        httpOnly: true,
        sameSite: true,
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

app.use(function(req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.status(404).render('website_error.ejs');
    } else {
        next();
    }
})


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
    // rememberto parse the token
    var token = JSON.parse(cryptr.decrypt(req.query.token));
    var past_time = token.timestamp;
    var present_time = moment().format('x');
    console.log(past_time + " : " + present_time);
    var time_diff = present_time - past_time;
    sess.useripinfo = req.ipInfo;
    //res.send(req.ipInfo);
    console.log(time_diff);
    if ((sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        sess.unique_id = token.unique_id;
        res.render("registration.ejs");
    } else {
        res.render("error.ejs");
    }

});

app.get('/login_page', function(req, res) {
    var sess = req.session;
    sess.useripinfo = req.ipInfo;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        res.render("login.ejs");
    } else {
        res.render("error.ejs");
    }
});

app.post('/visitorid', urlencodedParser, function(req, res) {
     var sess = req.session;
     sess.fingerprint = req.body.visitorId;
     var response = { status : true}
     res.send(JSON.stringify(response));
})

app.get('/stats', function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        res.render('maintainance.ejs');
    } else {
        res.render("error.ejs");
    }
});

app.get('/likes', function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        res.render('maintainance.ejs');
    } else {
        res.render("error.ejs");
    }
});

app.get('/qna', function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        res.render('maintainance.ejs');
    } else {
        res.render("error.ejs");
    }
});

app.get('/chats', function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        res.render('maintainance.ejs');
    } else {
        res.render("error.ejs");
    }
});

app.get('/materials', function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        res.render('maintainance.ejs');
    } else {
        res.render("error.ejs");
    }
});

app.post('/login', urlencodedParser, function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        var response = { username: req.body.username, password: req.body.password, unique_id: sess.unique_id };
        database_search({ username: req.body.username }).then(function(result) {
            console.log(result);
            console.log(response);
            if (result) {
                if (response.username == result.username && response.password == result.password && response.unique_id == result.unique_id) {
                    console.log(response);
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
                    var response_result = { form_ver: 'valid pswd', form_redirect: 'home' };
                    res.end(JSON.stringify(response_result));
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


app.post('/registration', urlencodedParser, function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        var response = { username: req.body.username, password: req.body.password, branch: req.body.branch, phonenumber: req.body.phonenumber, phoneverified: false, unique_id: sess.unique_id, userblocked: true, video_watch_hour: 0, lec_quality: "highest", logincount: 0, like: [], dislike: [], points: 0, rank: 0 };
        console.log(response);
        reg_verify_deviceid_username(sess.unique_id, req.body.username, req.body.phonenumber).then(function(result) {
            if (result) {
                if (result.dupname || result.dupdev || result.dupphone) {
                    var response_result = { form_dupname: result.dupname, form_dupdev: result.dupdev, form_dupphone: result.dupphone, form_success: false };
                    console.log(response_result);
                    res.end(JSON.stringify(response_result));
                } else {
                    user_details_model.create(response, function(err, result) {
                        if (err) {
                            console.log(err);
                            var response_result = { form_dupname: result.dupname, form_dupdev: result.dupdev, form_dupphone: result.dupphone, form_success: false };
                            console.log(response_result);
                            res.end(JSON.stringify(response_result));
                        } else {
                            var response_result = { form_dupname: result.dupname, form_dupdev: result.dupdev, form_dupphone: result.dupphone, form_success: true };
                            console.log(response_result);
                            res.end(JSON.stringify(response_result));
                        }
                    })
                } /**/
            }
        })
    } else {
        var response_result = { form_dupname: false, form_dupdev: true, form_dupphone: false, form_success: false };
        console.log(response_result);
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


app.get('/home', function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        var response = { username: sess.username, phonenumber: sess.phonenumber, phonestate: sess.phoneverified, userblocked: sess.userblocked, branch: sess.branch, lec_quality: sess.lec_quality };
        console.log(response);
        res.render('home.ejs', response);
    } else {
        res.render("error.ejs");
    }
});



app.post('/update_detail', urlencodedParser, async function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        let promise1 = new Promise((resolve, reject) => {
            var search_value = { username: req.body.username, unique_id: sess.unique_id };
            var newupdatevalue = { lec_quality: req.body.lec_quality };
            updatevalue(search_value, newupdatevalue).then(function(result) {
                var temp_lec_quality_code = result + '_lec_quality';
                if (result == 'success') {
                    sess.lec_quality = req.body.lec_quality;
                }
                resolve(temp_lec_quality_code);
            });
        }).catch(error => {
            resolve("fail_lec_quality");
            console.log(error)
        })


        let promise2 = new Promise((resolve, reject) => {
            if (!sess.phoneverified) {
                var search_value = { username: req.body.username, unique_id: sess.unique_id };
                var newupdatevalue = { phonenumber: req.body.phonenumber };
                countdocuments(newupdatevalue).then(function(result) {
                    if (result < 1) {
                        updatevalue(search_value, newupdatevalue).then(function(result) {
                            var temp_phone_code = result + '_phone';
                            if (result == 'success') {
                                sess.phonenumber = req.body.phonenumber;
                            }
                            resolve(temp_phone_code);
                        });
                    } else {
                        var temp_phone_code = 'duplicate_phone';
                        resolve(temp_phone_code);
                    }
                })
            }
        }).catch(error => {
            resolve("fail_lec_quality");
            console.log(error)
        })

        let resultfinal1 = await promise1;
        let resultfinal2 = await promise2;

        var response_code = { lec_quality_code: resultfinal1, phone_code: resultfinal2 };
        console.log(response_code);
        res.end(JSON.stringify(response_code));
    }
})


async function countdocuments(search_value) {
    let promise = new Promise((resolve, reject) => {

        user_details_model.countDocuments(search_value, function(err, c) {
            if (err) {
                console.log(err);
                res.end('failed')
            };
            resolve(c);
        })
    }).catch(error => {
        console.log(error)
    })
    let resultfinal = await promise;
    return resultfinal;
}

app.get('/lecture', function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")){
        res.render(sess.branch + '_subjectlist.ejs');
    } else {
        res.render('error.ejs')
    }
})


app.get('/playlist', function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        sess.subject = req.query.subject;
        res.render('playlist.ejs');
    } else {
        res.render('error.ejs');
    }
})

app.post('/playlist_info', urlencodedParser, async function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
        var response_code = { branch: sess.branch, subject: sess.subject };
        var query_code = { lec_num: 1, lec_name: 1 }
        subjectlist_model.find(response_code, query_code).sort({ $natural: -1 }).exec(function(err, result) {
            console.log(result);
            res.send(JSON.stringify(result));
        })
    }
})



/////////

app.get('/player', function(req, res) {
    var sess = req.session;
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
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
                    if (sess.lec_quality == 'lowest') {
                        for (var i = 0; i < info_data.formats.length; i++) {
                            if (info_data.formats[i].qualityLabel == '360p' && info_data.formats[i].container == 'mp4' && info_data.formats[i].hasVideo == true && info_data.formats[i].hasAudio == false) {
                                vid_container.push(info_data.formats[i]);
                            }
                            if (i == info_data.formats.length - 1) {
                                let formatv = vid_container[0];
                                let formata = ytdl.chooseFormat(info_data.formats, { quality: 'lowestaudio' });
                                sess.videolink = formatv.url;
                                sess.audiolink = formata.url;
                                console.log(sess);
                            }
                        }
                    } else if (sess.lec_quality == 'high') {
                        for (var i = 0; i < info_data.formats.length; i++) {
                            if (info_data.formats[i].qualityLabel == '720p' && info_data.formats[i].container == 'mp4' && info_data.formats[i].hasVideo == true && info_data.formats[i].hasAudio == false) {
                                vid_container.push(info_data.formats[i]);
                            }
                            if (i == info_data.formats.length - 1) {
                                let formatv = vid_container[0];
                                let formata = ytdl.chooseFormat(info_data.formats, { quality: 'highestaudio' });
                                sess.videolink = formatv.url;
                                sess.audiolink = formata.url;
                                console.log(sess);
                            }
                        }
                    } else if (sess.lec_quality == 'medium') {
                        for (var i = 0; i < info_data.formats.length; i++) {
                            if (info_data.formats[i].qualityLabel == '480p' && info_data.formats[i].container == 'mp4' && info_data.formats[i].hasVideo == true && info_data.formats[i].hasAudio == false) {
                                vid_container.push(info_data.formats[i]);
                            }
                            if (i == info_data.formats.length - 1) {
                                let formatv = vid_container[0];
                                let formata = ytdl.chooseFormat(info_data.formats, { quality: 'lowestaudio' });
                                sess.videolink = formatv.url;
                                sess.audiolink = formata.url;
                                console.log(sess);
                            }
                        }
                    } else {
                        let formatv = ytdl.chooseFormat(info_data.formats, { quality: 'highestvideo' });
                        let formata = ytdl.chooseFormat(info_data.formats, { quality: 'highestaudio' });
                        sess.videolink = formatv.url;
                        sess.audiolink = formata.url;
                        console.log(sess);
                    }



                    if (sess.like.includes(sess.subject + ':' + sess.lec_num)) {
                        var like_status = true;
                        res.render('player.ejs', { ip_address : sess.useripinfo.ip , username : sess.username, phonenumber : sess.phonenumber, branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num, lec_name: data.lec_name, like: data.sublike, dislike: data.subdislike, like_status: like_status, views: data.views });
                    } else if (sess.dislike.includes(sess.subject + ':' + sess.lec_num)) {
                        var like_status = false;
                        res.render('player.ejs', { ip_address : sess.useripinfo.ip , username : sess.username, phonenumber : sess.phonenumber,  branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num, lec_name: data.lec_name, like: data.sublike, dislike: data.subdislike, like_status: like_status, views: data.views });
                    } else {
                        var like_status = '';
                        res.render('player.ejs', { ip_address : sess.useripinfo.ip , username : sess.username, phonenumber : sess.phonenumber, branch: sess.branch, subject: sess.subject, lec_num: sess.lec_num, lec_name: data.lec_name, like: data.sublike, dislike: data.subdislike, like_status: like_status, views: data.views });
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
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
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
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
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
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
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
    if (sess.unique_id && (sess.useripinfo.country == "IN" || sess.useripinfo.country == "TR")) {
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


app.get('*', function(req, res) {
    res.render('maintainance.ejs');
});


app.listen(PORT, function() { console.log('listening') });