/**
 * Created by liuqiang on 16/4/27.
 */

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var process = require('process');
var cfg = require('./config.json')
var db = require('./models');
var yxdDB = require('./models_yxd');
// api controllers
var route_table = require('./routes/routeTable');
var fs=require('fs');
var api = require('./util/api.js')
var http = require("http");


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
for(var key in route_table){
    app.use('/api',route_table[key]);
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

var server = app.listen(app.get('port'), function() {
    console.log('server listening on port ' + server.address().port);
});


// var dt = 1000000000
// var name = ['无名等','无名灯','唔明邓','唔明等','唔明等','唔明等','唔明等']
// var name1 = ['体重+足部扫描','仅体重','体重+足部扫描','体重+足部扫描','仅体重','仅体重','体重+足部扫描']
// for(var i=0;i<100;i++){
//     var statue =  Math.ceil(Math.random()*10)-5
//     if(statue<0){
//         statue = 0
//     }else if(statue>4) {
//         statue = 4
//     }

    // var ud = {id:dt+i,addr_o:'福建省厦门市思明区',addr_a:'莲花二村观远里48号楼',goods_size:41,goods_color:1,goods_count:1,custom:'吴明灯',custom_phone:'13616063967',pro_no:1,goods_info:'法国老牌珍贵水祛痘神仙水杨酸爽肤水闭口粉刺控油375ml',goods_icon:'https://gd3.alicdn.com/imgextra/i3/77155078/TB2kTrmnJhvOuFjSZFBXXcZgFXa_!!77155078.jpg_400x400.jpg',goods_price:100,goods_discount:20}
//     var ud = {id:i,patient_no:name[statue],gravida_week:statue,content:name1[statue]}
//     db.visits.upsert(ud).then((data)=>{
//
//     })
// }
//     var ud = {price:100,discount:10,info:'香港代购法国老牌珍贵水祛痘神仙水杨酸爽肤水闭口粉刺控油375ml',icon:'https://raw.githubusercontent.com/taylorchen709/markdown-images/master/vueadmin/user.png'}
//     db.goods.upsert(ud).then((data)=>{
//
//     })
//
//
// var data = api.getOrderTracesByJson("YTO",'885315673857929159')
// var opt = {
//     // host:'testapi.kdniao.cc',
//     // http://testapi.kdniao.cc:8081/api/dist
//     host:'api.kdniao.cc',
//     port:'80',
//     method:'POST',
//     // path:'/Ebusiness/EbusinessOrderHandle.aspx',
//     path:'/api/dist',
//     headers:{
//         "Content-Type": 'application/x-www-form-urlencoded;charset=utf-8',
//         "Content-Length": data.length
//     }
// }
// var req = http.request(opt, function(res) {
//     res.setEncoding('utf8');
//     console.log("response: " + res.statusCode);
//     var str = ""
//     res.on('data',function(d){
//         str += d;
//     }).on('end', function(){
//         var body=JSON.parse(str);
//         console.log(body)
//     });
// }).on('error', function(e) {
//     console.log("error: " + e.message);
// })
//
// req.write(data + "\n");
// req.end();