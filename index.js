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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// init routes// static pages if needed
app.use(express.static(path.join(__dirname, 'static')));
//app.get('/',function(req,res){
//    res.write("<html><h1>svn</h1></html>");
//});

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

// db.orders.findAll().then(function(data){
//         console.log(data)
//     })