/**
 * Created by liuqiang on 16/4/27.
 */

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

var cfg = require('./config.json')
var db = require('./models');
// api controllers
var route_table = require('./routes/routeTable');


var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var hour = 3600000
app.use(session({
    name:"sid",
    cookie:{
        expires:new Date(Date.now() + hour),
        maxAge:hour,
    },
    saveUninitialized : false,
    resave : true,
    store: new RedisStore({
        host:'127.0.0.1',
        port:'6379'
    }),
    secret: 'fizzo'
}));

app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('oh no')) // handle error
    }
    next()
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// init routes// static pages if needed
app.use(express.static(path.join(__dirname, 'static')));
//app.get('/',function(req,res){
//    res.write("<html><h1>svn</h1></html>");
//});
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://192.168.18.165:8010");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",'Express')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
// middleware register

// api router
for(var key in route_table){
    app.use('/api',route_table[key]);
}

app.set('port', cfg.listen);


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

var server = app.listen(app.get('port'), function() {
    console.log('server listening on port ' + server.address().port);
});


// for(var i=0;i<100;i++){
//   db.reports.update({leg_judge:'nice leg',leg_health:'u can go to join malasong'},{where:{id:i}}).then((data)=>{

//   })
// }