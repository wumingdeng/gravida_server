/**
 * Created by liuqiang on 16/4/27.
 */

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var process = require('process');
var g = require('./global')
var cfg = g.cfg
var db = require('./models');
var yxdDB = require('./models_yxd');
// api controllers
var route_table = require('./routes/routeTable');
var fs = require('fs');
var api = require('./util/api.js')
var http = require("http");

var mem = require('./memory')
mem.f.InitDbMemory()

if (cfg.native == 1) {
    var session = require('express-session');
    var RedisStore = require('connect-redis')(session);

    var Days = 10
    var hour =  Days * 24 * 60 * 60 * 1000
    app.use(session({
        name: "sid",
        cookie: {
            expires: new Date(Date.now() + hour),
            maxAge: hour,
        },
        saveUninitialized: false,
        resave: true,
        store: new RedisStore({
            host: '127.0.0.1',
            port: '6379'
        }),
        secret: 'fizzo'
    }));

    app.use(function (req, res, next) {
        if (!req.session) {
            return next(new Error('oh no')) // handle error
        }
        next()
    })
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// init routes// static pages if needed
app.use(express.static(path.join(__dirname, 'static')));
//app.get('/',function(req,res){
//    res.write("<html><h1>svn</h1></html>");
//});
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", 'Express')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
// middleware register

// api router
for (var key in route_table) {
    app.use('/api', route_table[key]);
}

app.set('port', cfg.listen);

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack)
});


// // serve pure static assets
// var staticPath = '/static';
// app.use(staticPath, express.static(path.resolve(__dirname, '../simple_client//dist/static')))



// app.use(function (req, res) {
//   res.sendFile(path.resolve(__dirname, '../simple_client/dist/index.html'), {
//     headers: {
//       'Content-Type': 'text/html; charset=UTF-8'
//     }
//   });
// });

var server = app.listen(app.get('port'), function () {
    console.log('server listening on port ' + server.address().port);
});